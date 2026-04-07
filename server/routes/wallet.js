const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const path = require('path');

const GlobalStatsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  availableBalance: { type: Number, default: 0 },
  totalDeposit: { type: Number, default: 0 },
  totalWithdraw: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 }
}, { timestamps: true });

const GlobalStats = mongoose.models.GlobalStats || mongoose.model('GlobalStats', GlobalStatsSchema);

router.get('/global-stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    console.log('global-stats requested for user:', req.user.id);
    console.log('user.wallet:', JSON.stringify(user?.wallet));
    console.log('user.walletStats:', JSON.stringify(user?.walletStats));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const availableBalance = user.wallet?.balance ?? 0;
    const totalDeposit = user.walletStats?.totalDeposit ?? user.wallet?.deposits ?? 0;
    const totalWithdraw = user.walletStats?.totalWithdraw ?? user.wallet?.withdrawals ?? 0;
    const totalProfit = user.walletStats?.totalProfit ?? 0;

    console.log('Returning stats:', { availableBalance, totalDeposit, totalWithdraw, totalProfit });

    return res.json({
      balance: availableBalance,
      deposits: totalDeposit,
      withdrawals: totalWithdraw,
      profit: totalProfit,
      availableBalance: availableBalance,
      totalDeposit: totalDeposit,
      totalWithdraw: totalWithdraw,
      totalProfit: totalProfit
    });
  } catch (error) {
    console.error('Error fetching global-stats:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wallet walletStats');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      balance: user.wallet?.balance || 0,
      currency: user.wallet?.currency || 'USD',
      deposits: user.walletStats?.totalDeposit || user.wallet?.deposits || 0,
      withdrawals: user.walletStats?.totalWithdraw || user.wallet?.withdrawals || 0,
      profit: user.walletStats?.totalProfit || 0,
      walletStats: user.walletStats || {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount, currency = 'USD', method, walletAddress, transactionHash, coinSymbol, proofOfPaymentUrl, proofFilename } = req.body;

    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const transaction = new Transaction({
      user: req.user.id,
      type: 'deposit',
      amount,
      currency,
      method,
      walletAddress,
      transactionHash,
      coinSymbol: coinSymbol || 'BTC',
      proofOfPaymentUrl,
      proofFilename,
      status: method === 'crypto' ? 'pending' : 'completed'
    });

    if (method !== 'crypto') {
      const user = await User.findById(req.user.id);
      user.wallet.balance += amount;
      user.wallet.deposits += amount;
      await user.save();
    }

    await transaction.save();
    res.status(201).json({ transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/upload-proof', auth, async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    if (transactionId) {
      const transaction = await Transaction.findOne({ _id: transactionId, user: req.user.id });
      if (transaction) {
        transaction.proofOfPaymentUrl = fileUrl;
        transaction.proofFilename = req.file.originalname;
        await transaction.save();
        return res.json({ proofUrl: fileUrl, filename: req.file.originalname, transaction });
      }
    }
    
    res.json({ proofUrl: fileUrl, filename: req.file.originalname });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, currency = 'USD', method, walletAddress } = req.body;

    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const user = await User.findById(req.user.id);
    if (user.wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const fee = amount * 0.01;
    const netAmount = amount - fee;

    user.wallet.balance -= amount;
    user.wallet.withdrawals += amount;
    await user.save();

    const transaction = new Transaction({
      user: req.user.id,
      type: 'withdrawal',
      amount: netAmount,
      currency,
      method,
      walletAddress,
      fee,
      status: 'pending'
    });

    await transaction.save();
    res.status(201).json({ transaction, balance: user.wallet.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/transfer', auth, async (req, res) => {
  try {
    const { recipientId, amount } = req.body;

    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const sender = await User.findById(req.user.id);
    const recipient = await User.findById(recipientId);

    if (!recipient) return res.status(404).json({ message: 'Recipient not found' });
    if (sender.wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    sender.wallet.balance -= amount;
    recipient.wallet.balance += amount;
    await sender.save();
    await recipient.save();

    const transaction = new Transaction({
      user: req.user.id,
      type: 'transfer',
      amount,
      recipient: recipientId,
      status: 'completed'
    });

    await transaction.save();
    res.json({ transaction, balance: sender.wallet.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/transactions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, status } = req.query;
    const query = { user: req.user.id };
    
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, status, userId } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (userId) query.user = userId;

    const transactions = await Transaction.find(query)
      .populate('user', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    const stats = await Transaction.aggregate([
      { $match: query },
      { $group: { 
        _id: null, 
        totalDeposits: { $sum: { $cond: [{ $eq: ['$type', 'deposit'] }, '$amount', 0] } },
        totalWithdrawals: { $sum: { $cond: [{ $eq: ['$type', 'withdrawal'] }, '$amount', 0] } },
        totalVolume: { $sum: '$amount' }
      }}
    ]);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      stats: stats[0] || { totalDeposits: 0, totalWithdrawals: 0, totalVolume: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/approve', adminAuth, async (req, res) => {
  try {
    const { adminNote } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction already processed' });
    }

    if (transaction.type === 'deposit') {
      const user = await User.findById(transaction.user);
      user.wallet.balance += transaction.amount;
      user.wallet.deposits += transaction.amount;
      await user.save();
    }

    transaction.status = 'completed';
    transaction.processedBy = req.user.id;
    transaction.processedAt = new Date();
    if (adminNote) transaction.adminNote = adminNote;
    await transaction.save();

    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/reject', adminAuth, async (req, res) => {
  try {
    const { adminNote } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction already processed' });
    }

    if (transaction.type === 'withdrawal') {
      const user = await User.findById(transaction.user);
      user.wallet.balance += transaction.amount + transaction.fee;
      user.wallet.withdrawals -= transaction.amount;
      await user.save();
    }

    transaction.status = 'rejected';
    transaction.processedBy = req.user.id;
    transaction.processedAt = new Date();
    if (adminNote) transaction.adminNote = adminNote;
    await transaction.save();

    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/status', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    }).select('status');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ status: transaction.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
