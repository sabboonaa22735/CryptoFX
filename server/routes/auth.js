const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, generateRefreshToken, auth } = require('../middleware/auth');

const ADMIN_EMAIL = 'admin@platform.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_HASH = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYfL6Q5K4.G';

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone, referralCode } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    let referredBy = null;
    if (referralCode) {
      referredBy = await User.findOne({ referralCode });
    }

    const user = new User({
      email,
      password,
      name,
      phone: phone || '',
      referralCode: 'CF-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      referredBy: referredBy?._id,
      wallet: { balance: 1000 }
    });

    await user.save();

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        wallet: user.wallet,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser = {
        _id: 'admin-001',
        email: ADMIN_EMAIL,
        name: 'Admin',
        role: 'admin',
        password: ADMIN_HASH
      };
      
      const token = generateToken(adminUser);
      return res.json({
        token,
        refreshToken: generateRefreshToken(adminUser),
        user: {
          id: adminUser._id,
          email: adminUser.email,
          name: 'Admin',
          role: 'admin'
        }
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        wallet: user.wallet,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;
    
    if (!googleId) {
      return res.status(400).json({ message: 'Google ID is required' });
    }

    let user = await User.findOne({ googleId });
    
    if (!user && email) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        if (avatar && !user.avatar) user.avatar = avatar;
        await user.save();
      }
    }
    
    if (!user) {
      user = new User({
        email: email || `google_${googleId}@cryptofx.io`,
        name: name || 'Google User',
        googleId,
        avatar: avatar || '',
        wallet: { balance: 1000 },
        referralCode: 'CF-' + Math.random().toString(36).substr(2, 8).toUpperCase()
      });
      await user.save();
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        wallet: user.wallet,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/apple', async (req, res) => {
  try {
    const { appleId, email, name } = req.body;
    
    if (!appleId) {
      return res.status(400).json({ message: 'Apple ID is required' });
    }

    let user = await User.findOne({ appleId });
    
    if (!user && email) {
      user = await User.findOne({ email });
      if (user) {
        user.appleId = appleId;
        await user.save();
      }
    }
    
    if (!user) {
      user = new User({
        email: email || `apple_${appleId}@cryptofx.io`,
        name: name || 'Apple User',
        appleId,
        wallet: { balance: 1000 },
        referralCode: 'CF-' + Math.random().toString(36).substr(2, 8).toUpperCase()
      });
      await user.save();
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        wallet: user.wallet,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/face-login', async (req, res) => {
  try {
    const { faceId } = req.body;
    
    if (!faceId) {
      return res.status(400).json({ message: 'Face ID is required' });
    }

    let user = await User.findOne({ faceId });
    
    if (!user) {
      user = new User({
        email: `face_${faceId}@cryptofx.io`,
        name: 'Face User',
        faceId,
        wallet: { balance: 1000 },
        referralCode: 'CF-' + Math.random().toString(36).substr(2, 8).toUpperCase()
      });
      await user.save();
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        wallet: user.wallet,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/face-verify', async (req, res) => {
  try {
    const { faceId, email, name } = req.body;
    
    let user = await User.findOne({ faceId });
    if (!user) {
      user = new User({
        email: email || `face_${Date.now()}@cryptofx.io`,
        name: name || 'Face User',
        faceId,
        wallet: { balance: 1000 }
      });
      await user.save();
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        wallet: user.wallet,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const decoded = require('jsonwebtoken').verify(refreshToken, process.env.JWT_SECRET || 'cryptofx-secret-key-change-in-production');
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({ token: newToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const emailRegex = /^[a-z][a-z0-9.]*@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format. Must start with a letter and use lowercase.' });
    }
    
    const domain = email.split('@')[1]?.toLowerCase();
    const blockedDomains = ['tempmail.com', 'throwaway.com', 'fakeinbox.com', 'mailinator.com'];
    if (blockedDomains.includes(domain)) {
      return res.status(422).json({ 
        message: 'This email domain is not allowed. Please use a personal email address.',
        invalidDomain: true 
      });
    }
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(409).json({ 
        available: false, 
        message: 'This email is already registered. Please login instead.' 
      });
    }
    
    res.json({ available: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;