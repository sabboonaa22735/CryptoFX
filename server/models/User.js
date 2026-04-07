const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },
  name: { type: String, required: true },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  googleId: { type: String, select: false },
  appleId: { type: String, select: false },
  faceId: { type: String, select: false },
  wallet: {
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  walletStats: {
    availableBalance: { type: Number, default: 0 },
    totalDeposit: { type: Number, default: 0 },
    totalWithdraw: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 }
  },
  portfolio: [{
    symbol: String,
    amount: Number,
    avgPrice: Number
  }],
  watchlist: [{ type: String }],
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resetPasswordOTP: { type: String, select: false },
  resetPasswordOTPExp: { type: Date },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  if (!this.referralCode) {
    this.referralCode = 'CF-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);