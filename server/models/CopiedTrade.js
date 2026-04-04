const mongoose = require('mongoose');

const copiedTradeSchema = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trader: { type: mongoose.Schema.Types.ObjectId, ref: 'CopyTrader', required: true },
  originalTrade: { type: mongoose.Schema.Types.ObjectId, ref: 'Trade' },
  symbol: { type: String, required: true },
  assetType: { 
    type: String, 
    enum: ['crypto', 'stock', 'forex', 'index', 'futures', 'commodity'],
    required: true 
  },
  type: { type: String, enum: ['buy', 'sell'], required: true },
  quantity: { type: Number, required: true },
  entryPrice: { type: Number, required: true },
  exitPrice: { type: Number },
  leverage: { type: Number, default: 1 },
  copyRatio: { type: Number, default: 1 },
  amount: { type: Number, required: true },
  profitLoss: { type: Number, default: 0 },
  profitLossPercent: { type: Number, default: 0 },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  openedAt: { type: Date, default: Date.now },
  closedAt: { type: Date }
});

module.exports = mongoose.model('CopiedTrade', copiedTradeSchema);
