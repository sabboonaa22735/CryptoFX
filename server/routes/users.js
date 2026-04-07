const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      ...user.toObject(),
      wallet: {
        balance: user.wallet?.balance || 0,
        currency: user.wallet?.currency || 'USD',
        deposits: user.walletStats?.totalDeposit || user.wallet?.deposits || 0,
        withdrawals: user.walletStats?.totalWithdraw || user.wallet?.withdrawals || 0
      },
      walletStats: {
        availableBalance: user.walletStats?.availableBalance || user.wallet?.balance || 0,
        totalDeposit: user.walletStats?.totalDeposit || user.wallet?.deposits || 0,
        totalWithdraw: user.walletStats?.totalWithdraw || user.wallet?.withdrawals || 0,
        totalProfit: user.walletStats?.totalProfit || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/me', auth, async (req, res) => {
  try {
    const { name, phone, avatar, preferences } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, verified } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (verified) query.isVerified = verified === 'true';

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/verify', adminAuth, async (req, res) => {
  try {
    const { isVerified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/wallet', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const user = await User.findById(req.params.id).select('wallet');
    res.json(user.wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/kyc/submit', auth, async (req, res) => {
  try {
    const { documentType, documentNumber, documentImage, selfieImage } = req.body;
    const user = await User.findById(req.user.id);
    
    user.kyc = {
      status: 'pending',
      documentType,
      documentNumber,
      documentImage,
      selfieImage,
      submittedAt: new Date()
    };
    
    await user.save();
    res.json({ message: 'KYC submitted successfully', kyc: user.kyc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/kyc/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('kyc');
    res.json(user.kyc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
