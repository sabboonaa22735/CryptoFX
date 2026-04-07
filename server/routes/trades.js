const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Trade = require('../models/Trade');
const User = require('../models/User');
const { emitAdminUpdate } = require('../sockets');

router.post('/buy', auth, async (req, res) => {
  try {
    const { symbol, amount, price, orderType = 'market', leverage = 1, duration, returnPercent } = req.body;
    
    if (!symbol || !amount || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const numericAmount = parseFloat(amount);
    const numericPrice = parseFloat(price);
    const numericLeverage = parseFloat(leverage) || 1;
    const numericReturnPercent = parseFloat(returnPercent) || 1.53;
    const totalCost = numericAmount * numericPrice * numericLeverage;
    const profit = (numericAmount * numericReturnPercent * numericLeverage) / 100;
    const totalReturn = numericAmount + profit;

    if (isNaN(totalCost) || totalCost <= 0) {
      return res.status(400).json({ message: 'Invalid trade amount' });
    }
    
    if (user.wallet.balance < totalCost) {
      return res.status(400).json({ 
        message: `Insufficient balance. Required: $${totalCost.toFixed(2)}, Available: $${user.wallet.balance.toFixed(2)}` 
      });
    }

    user.wallet.balance -= totalCost;
    user.wallet.balance += totalReturn;
    
    if (!user.walletStats) {
      user.walletStats = { availableBalance: 0, totalDeposit: 0, totalWithdraw: 0, totalProfit: 0 };
    }
    user.walletStats.availableBalance = user.wallet.balance;
    user.walletStats.totalProfit = (user.walletStats.totalProfit || 0) + profit;
    
    await user.save();

    console.log('Trade executed - Balance after trade:', user.wallet.balance);
    console.log('Trade executed - Total profit updated:', user.walletStats.totalProfit);

    const trade = new Trade({
      user: req.user.id,
      type: 'buy',
      symbol,
      quantity: numericAmount,
      price: numericPrice,
      orderType,
      leverage: numericLeverage,
      total: numericAmount * numericPrice,
      profit: profit,
      status: 'completed'
    });
    
    await trade.save();

    if (!user.portfolio.find(p => p.symbol === symbol)) {
      user.portfolio.push({ symbol, amount: numericAmount, avgPrice: numericPrice });
    } else {
      const portfolioItem = user.portfolio.find(p => p.symbol === symbol);
      const totalAmount = portfolioItem.amount + numericAmount;
      portfolioItem.avgPrice = (portfolioItem.avgPrice * portfolioItem.amount + numericPrice * numericAmount) / totalAmount;
      portfolioItem.amount = totalAmount;
    }
    await user.save();

    emitAdminUpdate('trade_created', { 
      tradeId: trade._id, 
      userId: user._id, 
      symbol, 
      type: 'buy', 
      total: totalReturn,
      profit 
    });

    emitAdminUpdate('wallet_updated', { 
      userId: user._id, 
      balance: user.wallet.balance,
      totalProfit: user.walletStats?.totalProfit || 0
    });

    res.status(201).json({ trade, balance: user.wallet.balance, profit: profit, totalReturn: totalReturn });
  } catch (error) {
    console.error('Buy trade error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/sell', auth, async (req, res) => {
  try {
    const { symbol, amount, price, orderType = 'market', leverage = 1, returnPercent = 1.53 } = req.body;
    
    if (!symbol || !amount || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const numericAmount = parseFloat(amount);
    const numericPrice = parseFloat(price);
    const numericLeverage = parseFloat(leverage) || 1;
    const numericReturnPercent = parseFloat(returnPercent) || 1.53;
    
    const portfolioItem = user.portfolio.find(p => p.symbol === symbol);
    
    if (!portfolioItem || portfolioItem.amount < numericAmount) {
      return res.status(400).json({ 
        message: `Insufficient holdings. Required: ${numericAmount}, Available: ${portfolioItem?.amount || 0}` 
      });
    }

    const sellValue = numericAmount * numericPrice * numericLeverage;
    const costBasis = portfolioItem.avgPrice * numericAmount;
    const profitLoss = sellValue - costBasis;

    user.wallet.balance += sellValue;
    
    if (!user.walletStats) {
      user.walletStats = { availableBalance: 0, totalDeposit: 0, totalWithdraw: 0, totalProfit: 0 };
    }
    user.walletStats.availableBalance = user.wallet.balance;
    user.walletStats.totalProfit = (user.walletStats.totalProfit || 0) + profitLoss;
    
    portfolioItem.amount -= numericAmount;
    if (portfolioItem.amount === 0) {
      user.portfolio = user.portfolio.filter(p => p.symbol !== symbol);
    }
    await user.save();

    const trade = new Trade({
      user: req.user.id,
      type: 'sell',
      symbol,
      quantity: numericAmount,
      price: numericPrice,
      orderType,
      leverage: numericLeverage,
      total: numericAmount * numericPrice,
      profit: profitLoss,
      status: 'completed'
    });
    
    await trade.save();

    console.log('Sell trade executed - Profit/Loss:', profitLoss);
    console.log('Sell trade executed - Total Profit updated:', user.walletStats.totalProfit);

    emitAdminUpdate('trade_created', { 
      tradeId: trade._id, 
      userId: user._id, 
      symbol, 
      type: 'sell', 
      total: sellValue,
      profit: profitLoss
    });

    emitAdminUpdate('wallet_updated', { 
      userId: user._id, 
      balance: user.wallet.balance,
      totalProfit: user.walletStats.totalProfit
    });

    res.status(201).json({ trade, balance: user.wallet.balance, profit: profitLoss });
  } catch (error) {
    console.error('Sell trade error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, symbol, type, status } = req.query;
    const query = { user: req.user.id };
    
    if (symbol) query.symbol = symbol;
    if (type) query.type = type;
    if (status) query.status = status;

    const trades = await Trade.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trade.countDocuments(query);

    res.json({
      trades,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/open', auth, async (req, res) => {
  try {
    const trades = await Trade.find({ 
      user: req.user.id, 
      status: { $in: ['open', 'pending'] } 
    }).sort({ createdAt: -1 });
    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const trades = await Trade.find({ 
      user: req.user.id,
      status: 'completed'
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trade.countDocuments({ user: req.user.id, status: 'completed' });
    
    const stats = await Trade.aggregate([
      { $match: { user: req.user._id, status: 'completed' } },
      { $group: { 
        _id: null, 
        totalVolume: { $sum: { $multiply: ['$amount', '$price'] } },
        totalTrades: { $sum: 1 },
        totalProfit: { $sum: '$profit' }
      }}
    ]);

    res.json({
      trades,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      stats: stats[0] || { totalVolume: 0, totalTrades: 0, totalProfit: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, symbol, userId, status } = req.query;
    const query = {};
    
    if (symbol) query.symbol = symbol;
    if (userId) query.user = userId;
    if (status) query.status = status;

    const trades = await Trade.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trade.countDocuments(query);

    res.json({
      trades,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/futures/open', auth, async (req, res) => {
  try {
    const { symbol, amount, side, leverage = 1, entryPrice } = req.body;
    
    const user = await User.findById(req.user.id);
    const marginRequired = (amount * entryPrice) / leverage;
    
    if (user.wallet.balance < marginRequired) {
      return res.status(400).json({ message: 'Insufficient margin' });
    }

    user.wallet.balance -= marginRequired;
    await user.save();

    const trade = new Trade({
      user: req.user.id,
      type: side,
      symbol,
      quantity: amount,
      price: entryPrice,
      orderType: 'futures',
      leverage,
      isFutures: true,
      status: 'open',
      margin: marginRequired
    });
    
    await trade.save();
    res.status(201).json({ trade });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/futures/close', auth, async (req, res) => {
  try {
    const { tradeId, exitPrice } = req.body;
    
    const trade = await Trade.findOne({ _id: tradeId, user: req.user.id, status: 'open' });
    if (!trade) return res.status(404).json({ message: 'Open trade not found' });

    const user = await User.findById(req.user.id);
    const priceDiff = exitPrice - trade.price;
    const multiplier = trade.type === 'buy' ? 1 : -1;
    const profit = priceDiff * trade.amount * trade.leverage * multiplier;
    
    user.wallet.balance += trade.margin + profit;
    await user.save();

    trade.status = 'completed';
    trade.closePrice = exitPrice;
    trade.profit = profit;
    await trade.save();

    res.json({ trade, profit, balance: user.wallet.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const trade = await Trade.findOne({ _id: req.params.id, user: req.user.id });
    if (!trade) return res.status(404).json({ message: 'Trade not found' });
    res.json(trade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
