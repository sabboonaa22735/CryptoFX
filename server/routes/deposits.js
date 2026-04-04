const express = require('express');
const router = express.Router();
const DepositAddress = require('../models/DepositAddress');

router.get('/deposit-addresses', async (req, res) => {
  try {
    const { symbol } = req.query;
    let query = { isActive: true };
    
    if (symbol) {
      query.symbol = symbol.toUpperCase();
    }
    
    const addresses = await DepositAddress.find(query).sort({ coin: 1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/deposit-addresses/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const address = await DepositAddress.findOne({ 
      symbol: symbol.toUpperCase(), 
      isActive: true 
    });
    
    if (!address) {
      return res.status(404).json({ message: 'Deposit address not found for this coin' });
    }
    
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
