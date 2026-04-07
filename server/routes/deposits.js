const express = require('express');
const router = express.Router();
const DepositAddress = require('../models/DepositAddress');
const DepositSettings = require('../models/DepositSettings');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

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

router.get('/settings', async (req, res) => {
  try {
    const settings = await DepositSettings.getSettings();
    
    const publicSettings = {
      isEnabled: settings.isEnabled,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      general: settings.general,
      fees: settings.fees,
      coins: settings.coins,
      ui: settings.ui,
      messages: settings.messages,
    };
    
    res.json(publicSettings);
  } catch (error) {
    res.status(500).json({ 
      isEnabled: true,
      maintenanceMode: false,
      general: { minDeposit: 10, maxDeposit: 100000, paymentTimeoutMinutes: 30 },
      fees: { depositFeeType: 'none', depositFee: 0, depositFeePercent: 0 },
      coins: {},
      ui: { showTimer: true, showProgressSteps: true, showQRCode: true, showFeeInfo: true },
      messages: {},
    });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { amount, coin, address, proofImage } = req.body;
    console.log('POST /deposits called:', { amount, coin, address, proofImage, userId: req.user?.id });

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (!coin) {
      return res.status(400).json({ message: 'Coin is required' });
    }

    const transaction = new Transaction({
      user: req.user.id,
      type: 'deposit',
      amount: parseFloat(amount),
      coinSymbol: coin,
      walletAddress: address,
      proofFilename: proofImage,
      method: 'crypto',
      status: 'pending'
    });

    await transaction.save();
    console.log('Deposit created:', transaction._id, 'status:', transaction.status);

    res.status(201).json({ 
      message: 'Deposit submitted successfully',
      transaction 
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
