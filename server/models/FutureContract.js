const mongoose = require('mongoose');

const futureContractSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  assetType: { 
    type: String, 
    enum: ['crypto', 'stock', 'index', 'commodity', 'forex'],
    required: true 
  },
  contractSize: { type: Number, default: 1 },
  tickSize: { type: Number, default: 0.01 },
  marginRequirement: { type: Number, default: 10 },
  maxLeverage: { type: Number, default: 125 },
  fundingRate: { type: Number, default: 0 },
  nextFundingTime: { type: Date },
  expirationDate: { type: Date },
  currentPrice: { type: Number },
  high24h: { type: Number },
  low24h: { type: Number },
  volume24h: { type: Number, default: 0 },
  openInterest: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('FutureContract', futureContractSchema);
