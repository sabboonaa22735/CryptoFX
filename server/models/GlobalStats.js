const mongoose = require('mongoose');

const GlobalStatsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  availableBalance: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  totalDeposit: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.GlobalStats || mongoose.model('GlobalStats', GlobalStatsSchema);
