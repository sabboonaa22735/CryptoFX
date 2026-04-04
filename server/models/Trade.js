const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  assetType: { 
    type: String, 
    enum: ['crypto', 'stock', 'forex', 'index', 'futures', 'commodity'],
    default: 'crypto'
  },
  type: { type: String, enum: ['buy', 'sell'], required: true },
  orderType: { type: String, enum: ['market', 'limit', 'stop'], default: 'market' },
  side: { type: String, enum: ['long', 'short', 'buy', 'sell'], default: 'buy' },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  entryPrice: { type: Number },
  exitPrice: { type: Number },
  stopLoss: { type: Number },
  takeProfit: { type: Number },
  total: { type: Number, required: true },
  fees: { type: Number, default: 0 },
  leverage: { type: Number, default: 1 },
  margin: { type: Number },
  isFutures: { type: Boolean, default: false },
  positionSize: { type: Number },
  unrealizedPnL: { type: Number, default: 0 },
  realizedPnL: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'open', 'completed', 'cancelled', 'liquidated'], default: 'completed' },
  closedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trade', tradeSchema);