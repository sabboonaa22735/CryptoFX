const express = require('express');
const router = express.Router();
const GlobalStats = require('../models/GlobalStats');
const { auth } = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
  try {
    const portfolioStats = await GlobalStats.findOne({ key: 'portfolio' });
    
    if (!portfolioStats) {
      return res.json({
        totalBalance: 0,
        totalPL: 0,
        totalVolume: 0,
        totalTrades: 0
      });
    }

    res.json({
      totalBalance: portfolioStats.availableBalance || 0,
      totalPL: portfolioStats.totalProfit || 0,
      totalVolume: portfolioStats.totalDeposit || 0,
      totalTrades: 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
