const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, generateRefreshToken, auth } = require('../middleware/auth');
const nodemailer = require('nodemailer');

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
      wallet: { balance: 1000 },
      walletStats: { availableBalance: 1000, totalDeposit: 0, totalWithdraw: 0, totalProfit: 0 }
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
        walletStats: user.walletStats,
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
        walletStats: user.walletStats,
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

const crypto = require('crypto');

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

async function sendOTPEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'CryptoFX <noreply@cryptofx.com>',
    to: email,
    subject: 'CryptoFX Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset for your CryptoFX account.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Your OTP Code:</p>
          <p style="font-size: 32px; font-weight: bold; color: #1a73e8; margin: 0; letter-spacing: 8px;">${otp}</p>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in <strong>10 minutes</strong>.</p>
        <p style="color: #888; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`[OTP] Email sent to ${email}`);
}

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }
    
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExp = otpExpiry;
    await user.save();
    
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('[Email Error]', emailError.message);
      return res.status(500).json({ message: 'Failed to send OTP email. Please try again later.' });
    }
    
    res.json({ success: true, message: 'OTP sent to your email!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() }).select('+resetPasswordOTP');
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }
    
    if (!user.resetPasswordOTP || !user.resetPasswordOTPExp) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }
    
    if (new Date() > user.resetPasswordOTPExp) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }
    
    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    res.json({ success: true, message: 'OTP verified successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() }).select('+resetPasswordOTP');
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }
    
    if (!user.resetPasswordOTP || !user.resetPasswordOTPExp) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }
    
    if (new Date() > user.resetPasswordOTPExp) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }
    
    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExp = undefined;
    await user.save();
    
    res.json({ success: true, message: 'Password reset successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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