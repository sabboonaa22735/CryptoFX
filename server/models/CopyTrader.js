const mongoose = require('mongoose');

const copyTraderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  isPublic: { type: Boolean, default: true },
  totalTrades: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  profitLoss: { type: Number, default: 0 },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  strategies: [{
    name: { type: String, default: 'Default' },
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assetTypes: [{ type: String }]
  }],
  monthlyReturns: [{
    month: { type: String },
    return: { type: Number }
  }],
  assetClasses: [{ type: String }],
  avgHoldingTime: { type: Number, default: 0 },
  maxDrawdown: { type: Number, default: 0 },
  sharpeRatio: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalFollowers: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CopyTrader', copyTraderSchema);
