const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { superAdminAuth, superAdminLogin } = require('../middleware/superadmin');
const User = require('../models/User');
const Trade = require('../models/Trade');
const Transaction = require('../models/Transaction');
const Ticket = require('../models/Ticket');
const DepositAddress = require('../models/DepositAddress');
const TradeSettings = require('../models/TradeSettings');
const axios = require('axios');

router.post('/login', superAdminLogin);

router.use(superAdminAuth);

router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalTrades,
      totalVolume,
      pendingWithdrawals,
      pendingDeposits,
      openTickets,
      recentTrades
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      Trade.countDocuments(),
      Trade.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Transaction.countDocuments({ type: 'withdrawal', status: 'pending' }),
      Transaction.countDocuments({ type: 'deposit', status: 'pending' }),
      Ticket.countDocuments({ status: 'open' }),
      Trade.find().sort({ createdAt: -1 }).limit(10)
    ]);

    const totalRevenue = await Transaction.aggregate([
      { $match: { status: 'completed', type: { $in: ['deposit', 'withdrawal'] } } },
      { $group: { _id: null, total: { $sum: '$fee' } } }
    ]);

    const cryptoPrices = await getCryptoPrices();

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalTrades,
        totalVolume: totalVolume[0]?.total || 0,
        pendingWithdrawals,
        pendingDeposits,
        openTickets,
        totalRevenue: totalRevenue[0]?.total || 0,
        cryptoPrices
      },
      recentTrades
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.role = status;
    }
    
    const users = await User.find(query)
      .select('+password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const usersWithPasswordStatus = users.map(user => {
      const hasPassword = Boolean(user.password);
      const passwordLength = hasPassword ? user.password.length : 0;
      const maskedPassword = hasPassword ? '•'.repeat(Math.min(passwordLength, 12)) : null;
      
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.status || 'active',
        avatar: user.avatar,
        wallet: user.wallet,
        walletStats: user.walletStats,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        password: maskedPassword,
        hasPassword,
        passwordLength
      };
    });
    
    const total = await User.countDocuments(query);
    
    res.json({
      users: usersWithPasswordStatus,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, phone, balance, deposits, withdrawals, profit } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    const userData = {
      name,
      email,
      password,
      phone: phone || '',
      role: role || 'user'
    };
    
    if (balance !== undefined || deposits !== undefined || withdrawals !== undefined) {
      userData.wallet = {
        balance: parseFloat(balance) || 0,
        currency: 'USD',
        deposits: parseFloat(deposits) || 0,
        withdrawals: parseFloat(withdrawals) || 0
      };
    }
    
    if (profit !== undefined || balance !== undefined || deposits !== undefined || withdrawals !== undefined) {
      userData.walletStats = {
        availableBalance: parseFloat(balance) || 0,
        totalDeposit: parseFloat(deposits) || 0,
        totalWithdraw: parseFloat(withdrawals) || 0,
        totalProfit: parseFloat(profit) || 0
      };
    }
    
    const user = new User(userData);
    
    await user.save();
    
    const userResponse = user.toObject();
    const hasPassword = Boolean(user.password);
    userResponse.hasPassword = hasPassword;
    userResponse.phone = userResponse.phone || '';
    userResponse.password = hasPassword ? '•'.repeat(Math.min(user.password.length, 12)) : null;
    userResponse.wallet = user.wallet;
    userResponse.walletStats = user.walletStats;
    
    res.status(201).json({ message: 'User created successfully', user: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/users/reset-balances', async (req, res) => {
  try {
    await User.updateMany(
      {},
      { 
        $set: { 
          'wallet.balance': 0,
          'walletStats.availableBalance': 0
        }
      }
    );
    res.json({ message: 'All user balances reset to 0 successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userObj = user.toObject();
    const hasPassword = Boolean(user.password);
    userObj.hasPassword = hasPassword;
    userObj.phone = userObj.phone || '';
    userObj.password = hasPassword ? '•'.repeat(Math.min(user.password.length, 12)) : null;
    
    const trades = await Trade.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(50);
    const transactions = await Transaction.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(50);
    
    res.json({ user: userObj, trades, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, kyc, isVerified, phone, avatar, password, balance, deposits, withdrawals, profit } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (kyc !== undefined) user.kyc = kyc;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (password) user.password = password;
    
    if (!user.wallet) {
      user.wallet = { balance: 0, currency: 'USD', deposits: 0, withdrawals: 0 };
    }
    if (balance !== undefined && balance !== '') user.wallet.balance = parseFloat(balance);
    if (deposits !== undefined && deposits !== '') user.wallet.deposits = parseFloat(deposits);
    if (withdrawals !== undefined && withdrawals !== '') user.wallet.withdrawals = parseFloat(withdrawals);
    
    if (!user.walletStats) {
      user.walletStats = { availableBalance: 0, totalDeposit: 0, totalWithdraw: 0, totalProfit: 0 };
    }
    if (profit !== undefined && profit !== '') user.walletStats.totalProfit = parseFloat(profit);
    if (balance !== undefined && balance !== '') user.walletStats.availableBalance = parseFloat(balance);
    if (deposits !== undefined && deposits !== '') user.walletStats.totalDeposit = parseFloat(deposits);
    if (withdrawals !== undefined && withdrawals !== '') user.walletStats.totalWithdraw = parseFloat(withdrawals);
    
    await user.save();
    
    const userStatsKey = `user_${user._id.toString()}`;
    let userStats = await GlobalStats.findOne({ key: userStatsKey });
    if (!userStats) {
      userStats = new GlobalStats({ key: userStatsKey });
    }
    if (balance !== undefined && balance !== '') userStats.availableBalance = parseFloat(balance);
    if (deposits !== undefined && deposits !== '') userStats.totalDeposit = parseFloat(deposits);
    if (withdrawals !== undefined && withdrawals !== '') userStats.totalWithdraw = parseFloat(withdrawals);
    if (profit !== undefined && profit !== '') userStats.totalProfit = parseFloat(profit);
    await userStats.save();
    
    const userResponse = user.toObject();
    const hasPassword = Boolean(user.password);
    userResponse.hasPassword = hasPassword;
    userResponse.phone = userResponse.phone || '';
    userResponse.password = hasPassword ? '•'.repeat(Math.min(user.password.length, 12)) : null;
    userResponse.wallet = user.wallet;
    userResponse.walletStats = user.walletStats;
    
    res.json({ message: 'User updated successfully', user: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await Trade.deleteMany({ user: req.params.id });
    await Transaction.deleteMany({ user: req.params.id });
    
    res.json({ message: 'User and related data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id/wallet', async (req, res) => {
  try {
    const { balance, currency } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.wallet) {
      user.wallet = { balance: 0, currency: 'USD' };
    }
    
    if (balance !== undefined) user.wallet.balance = balance;
    if (currency) user.wallet.currency = currency;
    
    await user.save();

    const globalStats = await GlobalStats.findOne({ key: 'global' });
    if (globalStats) {
      if (balance !== undefined) globalStats.availableBalance = balance;
      await globalStats.save();
    }
    
    res.json({ message: 'Wallet updated successfully', wallet: user.wallet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const GlobalStatsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  availableBalance: { type: Number, default: 0 },
  totalDeposit: { type: Number, default: 0 },
  totalWithdraw: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 }
}, { timestamps: true });

const GlobalStats = mongoose.models.GlobalStats || mongoose.model('GlobalStats', GlobalStatsSchema);

router.get('/wallet-stats', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json({
        availableBalance: user.walletStats?.availableBalance || user.wallet?.balance || 0,
        totalDeposit: user.walletStats?.totalDeposit || 0,
        totalWithdraw: user.walletStats?.totalWithdraw || 0,
        totalProfit: user.walletStats?.totalProfit || 0
      });
    }
    
    let stats = await GlobalStats.findOne({ key: 'global' });
    
    if (!stats) {
      stats = new GlobalStats({
        key: 'global',
        availableBalance: 125000,
        totalDeposit: 500000,
        totalWithdraw: 375000,
        totalProfit: 0
      });
      await stats.save();
    }
    
    res.json({
      availableBalance: stats.availableBalance,
      totalDeposit: stats.totalDeposit,
      totalWithdraw: stats.totalWithdraw,
      totalProfit: stats.totalProfit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/wallet-stats', async (req, res) => {
  try {
    const { userId, availableBalance, totalDeposit, totalWithdraw, totalProfit } = req.body;
    
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (!user.walletStats) {
        user.walletStats = {};
      }
      
      if (availableBalance !== undefined) {
        user.walletStats.availableBalance = availableBalance;
        user.wallet.balance = availableBalance;
      }
      if (totalDeposit !== undefined) user.walletStats.totalDeposit = totalDeposit;
      if (totalWithdraw !== undefined) user.walletStats.totalWithdraw = totalWithdraw;
      if (totalProfit !== undefined) user.walletStats.totalProfit = totalProfit;
      
      await user.save();
      
      let stats = await GlobalStats.findOne({ key: `user_${userId}` });
      if (!stats) {
        stats = new GlobalStats({
          key: `user_${userId}`,
          availableBalance: availableBalance || 0,
          totalDeposit: totalDeposit || 0,
          totalWithdraw: totalWithdraw || 0,
          totalProfit: totalProfit || 0
        });
      } else {
        if (availableBalance !== undefined) stats.availableBalance = availableBalance;
        if (totalDeposit !== undefined) stats.totalDeposit = totalDeposit;
        if (totalWithdraw !== undefined) stats.totalWithdraw = totalWithdraw;
        if (totalProfit !== undefined) stats.totalProfit = totalProfit;
      }
      await stats.save();
      
      return res.json({ 
        message: 'User wallet stats updated successfully',
        walletStats: user.walletStats,
        wallet: user.wallet
      });
    }
    
    let stats = await GlobalStats.findOne({ key: 'global' });
    if (!stats) {
      stats = new GlobalStats({
        key: 'global',
        availableBalance: availableBalance || 0,
        totalDeposit: totalDeposit || 0,
        totalWithdraw: totalWithdraw || 0,
        totalProfit: totalProfit || 0
      });
    } else {
      if (availableBalance !== undefined) stats.availableBalance = availableBalance;
      if (totalDeposit !== undefined) stats.totalDeposit = totalDeposit;
      if (totalWithdraw !== undefined) stats.totalWithdraw = totalWithdraw;
      if (totalProfit !== undefined) stats.totalProfit = totalProfit;
    }
    
    await stats.save();
    
    res.json({ 
      message: 'Global wallet stats updated successfully',
      walletStats: stats
    });
  } catch (error) {
    console.error('Error saving wallet stats:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/portfolio-stats', async (req, res) => {
  try {
    const { userId } = req.query;
    const key = userId ? `portfolio_${userId}` : 'portfolio';
    
    const portfolioStats = await GlobalStats.findOne({ key });
    
    if (!portfolioStats) {
      if (userId) {
        return res.json({
          totalBalance: 0,
          totalPL: 0,
          totalVolume: 0,
          totalTrades: 0
        });
      }
      const defaultStats = new GlobalStats({
        key: 'portfolio',
        availableBalance: 1621000,
        totalDeposit: 2500000,
        totalWithdraw: 875000,
        totalProfit: 45250
      });
      await defaultStats.save();
      
      return res.json({
        totalBalance: defaultStats.availableBalance,
        totalPL: defaultStats.totalProfit,
        totalVolume: 8950000,
        totalTrades: 12450
      });
    }
    
    res.json({
      totalBalance: portfolioStats.availableBalance,
      totalPL: portfolioStats.totalProfit,
      totalVolume: portfolioStats.totalDeposit,
      totalTrades: 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/portfolio-stats', async (req, res) => {
  try {
    const { userId, totalBalance, totalPL, totalVolume, totalTrades } = req.body;
    
    const key = userId ? `portfolio_${userId}` : 'portfolio';
    let stats = await GlobalStats.findOne({ key });
    
    if (!stats) {
      stats = new GlobalStats({
        key,
        availableBalance: totalBalance || 0,
        totalDeposit: totalVolume || 0,
        totalWithdraw: 0,
        totalProfit: totalPL || 0
      });
    } else {
      if (totalBalance !== undefined) stats.availableBalance = totalBalance;
      if (totalPL !== undefined) stats.totalProfit = totalPL;
      if (totalVolume !== undefined) stats.totalDeposit = totalVolume;
    }
    
    await stats.save();
    
    res.json({ 
      message: 'Portfolio stats updated successfully',
      portfolioStats: {
        totalBalance: totalBalance,
        totalPL: totalPL,
        totalVolume: totalVolume,
        totalTrades: totalTrades
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/trades', async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, type, status } = req.query;
    const query = {};
    
    if (userId) query.user = userId;
    if (type) query.type = type;
    if (status) query.status = status;
    
    const trades = await Trade.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Trade.countDocuments(query);
    
    res.json({
      trades,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/trades', async (req, res) => {
  try {
    const { userId, symbol, type, quantity, price, assetType } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const total = quantity * price;
    
    if (type === 'buy') {
      if (user.wallet.balance < total) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      user.wallet.balance -= total;
    } else {
      user.wallet.balance += total;
    }
    
    await user.save();
    
    const trade = new Trade({
      user: userId,
      symbol,
      type,
      assetType: assetType || 'crypto',
      quantity,
      price,
      total,
      status: 'completed'
    });
    
    await trade.save();
    
    res.json({ message: 'Trade executed successfully', trade });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/trades/:id', async (req, res) => {
  try {
    const { status, profitLoss } = req.body;
    
    const trade = await Trade.findById(req.params.id);
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    
    if (status) trade.status = status;
    if (profitLoss !== undefined) trade.realizedPnL = profitLoss;
    
    await trade.save();
    
    res.json({ message: 'Trade updated successfully', trade });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/trades/:id', async (req, res) => {
  try {
    const trade = await Trade.findByIdAndDelete(req.params.id);
    
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    
    res.json({ message: 'Trade deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, type, status } = req.query;
    const query = {};
    
    if (userId) query.user = userId;
    if (type) query.type = type;
    if (status) query.status = status;
    
    const transactions = await Transaction.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Transaction.countDocuments(query);
    
    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/transactions', async (req, res) => {
  try {
    const { userId, type, amount, currency, method } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const transaction = new Transaction({
      user: userId,
      type,
      amount,
      currency: currency || 'USD',
      status: type === 'deposit' ? 'completed' : 'pending',
      method: method || 'admin'
    });
    
    if (type === 'deposit') {
      user.wallet.balance += amount;
      await user.save();
    }
    
    await transaction.save();
    
    res.json({ message: 'Transaction created successfully', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/deposits', async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const query = { type: 'deposit' };
    
    if (status) query.status = status;
    
    const deposits = await Transaction.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Transaction.countDocuments(query);
    const stats = await Transaction.aggregate([
      { $match: { type: 'deposit' } },
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$amount' }
      }}
    ]);
    
    res.json({
      deposits,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/deposits/:id/approve', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Deposit not found' });
    }
    
    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit already processed' });
    }
    
    const user = await User.findById(transaction.user);
    if (user) {
      user.wallet.balance += transaction.amount;
      if (!user.walletStats) user.walletStats = {};
      user.walletStats.totalDeposit = (user.walletStats.totalDeposit || 0) + transaction.amount;
      await user.save();
    }
    
    transaction.status = 'completed';
    await transaction.save();
    
    res.json({ message: 'Deposit approved successfully', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/deposits/:id/reject', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Deposit not found' });
    }
    
    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit already processed' });
    }
    
    transaction.status = 'rejected';
    await transaction.save();
    
    res.json({ message: 'Deposit rejected', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/transactions/:id', async (req, res) => {
  try {
    const { status, approved } = req.body;
    
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    if (status) {
      transaction.status = status;
      
      if (status === 'completed' && transaction.type === 'withdrawal' && approved) {
        const user = await User.findById(transaction.user);
        if (user) {
          user.wallet.balance -= transaction.amount + (transaction.fee || 0);
          await user.save();
        }
      }
    }
    
    await transaction.save();
    
    res.json({ message: 'Transaction updated successfully', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/transactions/:id/approve', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('user', 'name email wallet');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction already processed' });
    }
    
    if (transaction.type === 'deposit') {
      const user = await User.findById(transaction.user);
      if (user) {
        user.wallet.balance += transaction.amount;
        user.wallet.deposits = (user.wallet.deposits || 0) + transaction.amount;
        await user.save();
      }
    }
    
    transaction.status = 'completed';
    await transaction.save();
    
    res.json({ 
      message: 'Transaction approved successfully', 
      transaction,
      user: transaction.user 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/transactions/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    
    const transaction = await Transaction.findById(req.params.id).populate('user', 'name email');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction already processed' });
    }
    
    transaction.status = 'rejected';
    transaction.reference = reason || 'Rejected by admin';
    await transaction.save();
    
    res.json({ 
      message: 'Transaction rejected', 
      transaction 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/deposit-addresses', async (req, res) => {
  try {
    const addresses = await DepositAddress.find().sort({ coin: 1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/deposit-addresses', async (req, res) => {
  try {
    const { coin, symbol, network, address, memo, minDeposit, maxDeposit, fee, feeType, qrBg, qrFg } = req.body;
    
    const existing = await DepositAddress.findOne({ symbol: symbol.toUpperCase(), network: network || 'MAINNET' });
    if (existing) {
      return res.status(400).json({ message: 'Address already exists for this coin and network' });
    }
    
    const depositAddress = new DepositAddress({
      coin,
      symbol: symbol.toUpperCase(),
      network: network || 'MAINNET',
      address,
      memo,
      minDeposit: minDeposit || 0,
      maxDeposit,
      fee: fee || 0,
      feeType: feeType || 'none',
      qrBg: qrBg || '#ffffff',
      qrFg: qrFg || '#000000'
    });
    
    await depositAddress.save();
    
    res.json({ message: 'Deposit address added successfully', depositAddress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/deposit-addresses/:id', async (req, res) => {
  try {
    const { address, memo, minDeposit, maxDeposit, fee, feeType, isActive, network, qrBg, qrFg } = req.body;
    
    const depositAddress = await DepositAddress.findById(req.params.id);
    if (!depositAddress) {
      return res.status(404).json({ message: 'Deposit address not found' });
    }
    
    if (address) depositAddress.address = address;
    if (memo !== undefined) depositAddress.memo = memo;
    if (minDeposit !== undefined) depositAddress.minDeposit = minDeposit;
    if (maxDeposit !== undefined) depositAddress.maxDeposit = maxDeposit;
    if (fee !== undefined) depositAddress.fee = fee;
    if (feeType) depositAddress.feeType = feeType;
    if (isActive !== undefined) depositAddress.isActive = isActive;
    if (network !== undefined) depositAddress.network = network;
    if (qrBg !== undefined) depositAddress.qrBg = qrBg;
    if (qrFg !== undefined) depositAddress.qrFg = qrFg;
    depositAddress.lastUpdatedBy = 'superadmin';
    
    await depositAddress.save();
    
    res.json({ message: 'Deposit address updated successfully', depositAddress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/deposit-addresses/:id', async (req, res) => {
  try {
    const depositAddress = await DepositAddress.findByIdAndDelete(req.params.id);
    
    if (!depositAddress) {
      return res.status(404).json({ message: 'Deposit address not found' });
    }
    
    res.json({ message: 'Deposit address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/tickets', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    const tickets = await Ticket.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Ticket.countDocuments(query);
    
    res.json({
      tickets,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/tickets/:id/respond', async (req, res) => {
  try {
    const { message } = req.body;
    
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    ticket.messages.push({
      sender: 'superadmin',
      message,
      timestamp: new Date()
    });
    
    if (ticket.status === 'open') {
      ticket.status = 'in_progress';
    }
    
    await ticket.save();
    
    res.json({ message: 'Response sent successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    
    const [
      tradesByDay,
      volumeByDay,
      newUsersByDay,
      depositsByDay,
      withdrawalsByDay
    ] = await Promise.all([
      Trade.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Trade.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, volume: { $sum: '$total' } } },
        { $sort: { _id: 1 } }
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'deposit', status: 'completed', createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$amount' } } },
        { $sort: { _id: 1 } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'withdrawal', status: 'completed', createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$amount' } } },
        { $sort: { _id: 1 } }
      ])
    ]);
    
    res.json({
      tradesByDay,
      volumeByDay,
      newUsersByDay,
      depositsByDay,
      withdrawalsByDay
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function getCryptoPrices() {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
    const relevantSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];
    
    return relevantSymbols.map(s => {
      const ticker = response.data.find(t => t.symbol === s);
      return ticker ? {
        symbol: s.replace('USDT', ''),
        price: parseFloat(ticker.lastPrice),
        change: parseFloat(ticker.priceChangePercent)
      } : null;
    }).filter(Boolean);
  } catch {
    return [];
  }
}

router.get('/trade-settings', async (req, res) => {
  try {
    const settings = await TradeSettings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/trade-settings', async (req, res) => {
  try {
    const { durations, leverage, fees, limits, isEnabled, maintenanceMode } = req.body;
    
    let settings = await TradeSettings.findOne({ key: 'trade_settings' });
    
    if (!settings) {
      settings = new TradeSettings({ key: 'trade_settings' });
    }
    
    if (durations !== undefined) settings.durations = durations;
    if (leverage !== undefined) settings.leverage = { ...settings.leverage, ...leverage };
    if (fees !== undefined) settings.fees = { ...settings.fees, ...fees };
    if (limits !== undefined) settings.limits = { ...settings.limits, ...limits };
    if (isEnabled !== undefined) settings.isEnabled = isEnabled;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    settings.updatedAt = new Date();
    
    await settings.save();
    
    res.json({ message: 'Trade settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/trade-settings/durations', async (req, res) => {
  try {
    const { durations } = req.body;
    
    if (!Array.isArray(durations)) {
      return res.status(400).json({ message: 'Durations must be an array' });
    }
    
    let settings = await TradeSettings.findOne({ key: 'trade_settings' });
    if (!settings) {
      settings = new TradeSettings({ key: 'trade_settings' });
    }
    
    settings.durations = durations.map(d => ({
      value: d.value,
      label: d.label,
      returnPercent: d.returnPercent,
      risk: d.risk || 'low',
      isActive: d.isActive !== false
    }));
    settings.updatedAt = new Date();
    
    await settings.save();
    
    res.json({ message: 'Durations updated successfully', durations: settings.durations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
