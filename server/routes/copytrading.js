const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const CopyTrader = require('../models/CopyTrader');
const CopiedTrade = require('../models/CopiedTrade');
const Trade = require('../models/Trade');

router.get('/', async (req, res) => {
  try {
    const traders = await CopyTrader.find({ isPublic: true })
      .populate('user', 'name avatar')
      .lean();
    
    const leaderboard = traders
      .sort((a, b) => b.profitLoss - a.profitLoss)
      .slice(0, 10)
      .map((t, i) => ({
        rank: i + 1,
        traderId: t._id,
        username: t.username || t.user?.name,
        avatar: t.user?.avatar,
        winRate: t.winRate,
        totalReturn: t.profitLoss,
        followers: t.totalFollowers,
        trades: t.totalTrades,
        rating: t.rating,
        verified: t.verified
      }));
    
    res.json({ traders: leaderboard, total: traders.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/traders', async (req, res) => {
  try {
    const { sort = 'profit', order = 'desc', minTrades = 10, verified } = req.query;
    
    let query = { isPublic: true };
    
    if (verified === 'true') {
      query.verified = true;
    }
    
    let traders = await CopyTrader.find(query)
      .populate('user', 'name avatar')
      .lean();
    
    traders = traders.filter(t => t.totalTrades >= parseInt(minTrades));
    
    traders.sort((a, b) => {
      let valA, valB;
      
      switch (sort) {
        case 'profit':
          valA = a.profitLoss;
          valB = b.profitLoss;
          break;
        case 'winrate':
          valA = a.winRate;
          valB = b.winRate;
          break;
        case 'followers':
          valA = a.totalFollowers;
          valB = b.totalFollowers;
          break;
        case 'rating':
          valA = a.rating;
          valB = b.rating;
          break;
        default:
          valA = a.profitLoss;
          valB = b.profitLoss;
      }
      
      return order === 'desc' ? valB - valA : valA - valB;
    });
    
    res.json(traders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/traders/featured', async (req, res) => {
  try {
    const featured = await CopyTrader.find({ isPublic: true, verified: true })
      .populate('user', 'name avatar')
      .sort({ rating: -1, totalFollowers: -1 })
      .limit(5)
      .lean();
    
    res.json(featured);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/traders/:id', async (req, res) => {
  try {
    const trader = await CopyTrader.findById(req.params.id)
      .populate('user', 'name avatar email')
      .lean();
    
    if (!trader) {
      return res.status(404).json({ message: 'Trader not found' });
    }
    
    const trades = await Trade.find({ user: trader.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    res.json({
      ...trader,
      recentTrades: trades
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/traders/:id/stats', async (req, res) => {
  try {
    const trader = await CopyTrader.findById(req.params.id);
    
    if (!trader) {
      return res.status(404).json({ message: 'Trader not found' });
    }
    
    const trades = await Trade.find({ user: trader.user, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    
    const winningTrades = trades.filter(t => {
      const pnl = t.type === 'buy' 
        ? (t.price - t.entryPrice) * t.quantity
        : (t.entryPrice - t.price) * t.quantity;
      return pnl > 0;
    });
    
    const totalPnL = trades.reduce((sum, t) => {
      const pnl = t.type === 'buy' 
        ? (t.price - t.entryPrice) * t.quantity
        : (t.entryPrice - t.price) * t.quantity;
      return sum + pnl;
    }, 0);
    
    const avgWin = winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + (t.price - t.entryPrice) * t.quantity, 0) / winningTrades.length
      : 0;
    
    const losingTrades = trades.filter(t => {
      const pnl = t.type === 'buy' 
        ? (t.price - t.entryPrice) * t.quantity
        : (t.entryPrice - t.price) * t.quantity;
      return pnl < 0;
    });
    
    const avgLoss = losingTrades.length > 0
      ? losingTrades.reduce((sum, t) => sum + (t.price - t.entryPrice) * t.quantity, 0) / losingTrades.length
      : 0;
    
    const assetDistribution = {};
    trades.forEach(t => {
      assetDistribution[t.assetType] = (assetDistribution[t.assetType] || 0) + 1;
    });
    
    res.json({
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
      totalPnL,
      avgWin,
      avgLoss,
      profitFactor: avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0,
      bestTrade: Math.max(...trades.map(t => {
        const pnl = t.type === 'buy' 
          ? (t.price - t.entryPrice) * t.quantity
          : (t.entryPrice - t.price) * t.quantity;
        return pnl;
      })),
      worstTrade: Math.min(...trades.map(t => {
        const pnl = t.type === 'buy' 
          ? (t.price - t.entryPrice) * t.quantity
          : (t.entryPrice - t.price) * t.quantity;
        return pnl;
      })),
      assetDistribution,
      monthlyReturns: trader.monthlyReturns
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/become-trader', auth, async (req, res) => {
  try {
    const { username, bio } = req.body;
    
    const existingTrader = await CopyTrader.findOne({ user: req.user.id });
    if (existingTrader) {
      return res.status(400).json({ message: 'Already a copy trader' });
    }
    
    const trader = new CopyTrader({
      user: req.user.id,
      username: username || `trader_${req.user.id.toString().slice(-6)}`,
      bio: bio || '',
      isPublic: true
    });
    
    await trader.save();
    
    res.json(trader);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { username, bio, isPublic, strategies } = req.body;
    
    const trader = await CopyTrader.findOne({ user: req.user.id });
    
    if (!trader) {
      return res.status(404).json({ message: 'Trader profile not found' });
    }
    
    if (username) trader.username = username;
    if (bio !== undefined) trader.bio = bio;
    if (isPublic !== undefined) trader.isPublic = isPublic;
    if (strategies) trader.strategies = strategies;
    
    await trader.save();
    
    res.json(trader);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/follow/:traderId', auth, async (req, res) => {
  try {
    const trader = await CopyTrader.findById(req.params.traderId);
    
    if (!trader) {
      return res.status(404).json({ message: 'Trader not found' });
    }
    
    const isFollowing = trader.followers.includes(req.user.id);
    
    if (isFollowing) {
      trader.followers = trader.followers.filter(f => f.toString() !== req.user.id);
      trader.totalFollowers -= 1;
    } else {
      trader.followers.push(req.user.id);
      trader.totalFollowers += 1;
    }
    
    await trader.save();
    
    res.json({
      isFollowing: !isFollowing,
      totalFollowers: trader.totalFollowers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/copy/:traderId', auth, async (req, res) => {
  try {
    const { amount, copyRatio, stopLoss, takeProfit, stopFollowing } = req.body;
    
    const trader = await CopyTrader.findById(req.params.traderId);
    
    if (!trader) {
      return res.status(404).json({ message: 'Trader not found' });
    }
    
    const copySettings = {
      traderId: trader._id,
      amount: amount || 100,
      copyRatio: copyRatio || 1,
      stopLoss: stopLoss || -10,
      takeProfit: takeProfit || 20,
      stopFollowing: stopFollowing || false,
      isActive: true,
      minAmount: 10,
      maxAmount: 10000
    };
    
    res.json({
      message: 'Copy trading settings saved',
      settings: copySettings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my-settings', auth, async (req, res) => {
  try {
    const copySettings = {
      isCopyTrader: false,
      following: [],
      totalCopiers: 0
    };
    
    const myTraderProfile = await CopyTrader.findOne({ user: req.user.id });
    
    if (myTraderProfile) {
      copySettings.isCopyTrader = true;
      copySettings.profile = myTraderProfile;
      copySettings.totalCopiers = myTraderProfile.totalFollowers;
    }
    
    const followingTraders = await CopiedTrade.find({ follower: req.user.id })
      .populate('trader', 'username')
      .distinct('trader');
    
    copySettings.following = followingTraders;
    
    res.json(copySettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = { follower: req.user.id };
    if (status) {
      query.status = status;
    }
    
    const copiedTrades = await CopiedTrade.find(query)
      .populate('trader', 'username')
      .sort({ openedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    
    const total = await CopiedTrade.countDocuments(query);
    
    res.json({
      trades: copiedTrades,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'month', limit = 10 } = req.query;
    
    const traders = await CopyTrader.find({ isPublic: true })
      .populate('user', 'name avatar')
      .lean();
    
    const leaderboard = traders.map(t => ({
      rank: 0,
      traderId: t._id,
      username: t.username || t.user?.name,
      avatar: t.avatar || t.user?.avatar,
      winRate: t.winRate,
      totalReturn: t.profitLoss,
      followers: t.totalFollowers,
      trades: t.totalTrades,
      rating: t.rating,
      verified: t.verified
    }));
    
    leaderboard.sort((a, b) => b.totalReturn - a.totalReturn);
    leaderboard.slice(0, limit).forEach((t, i) => t.rank = i + 1);
    
    res.json(leaderboard.slice(0, limit));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/update-stats', auth, async (req, res) => {
  try {
    const trader = await CopyTrader.findOne({ user: req.user.id });
    
    if (!trader) {
      return res.status(404).json({ message: 'Trader profile not found' });
    }
    
    const trades = await Trade.find({ user: req.user.id, status: 'completed' })
      .sort({ createdAt: -1 });
    
    const winningTrades = trades.filter(t => {
      const pnl = t.type === 'buy' 
        ? (t.price - t.entryPrice) * t.quantity
        : (t.entryPrice - t.price) * t.quantity;
      return pnl > 0;
    });
    
    trader.totalTrades = trades.length;
    trader.winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
    
    const totalPnL = trades.reduce((sum, t) => {
      const pnl = t.type === 'buy' 
        ? (t.price - t.entryPrice) * t.quantity
        : (t.entryPrice - t.price) * t.quantity;
      return sum + pnl;
    }, 0);
    
    trader.profitLoss = totalPnL;
    
    const assetClasses = [...new Set(trades.map(t => t.assetType))];
    trader.assetClasses = assetClasses;
    
    await trader.save();
    
    res.json(trader);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
