const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coins: [{
    coinId: { type: String, required: true },
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    addedAt: { type: Date, default: Date.now }
  }],
  alerts: [{
    coinId: { type: String, required: true },
    targetPrice: { type: Number, required: true },
    direction: { type: String, enum: ['above', 'below'], required: true },
    triggered: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

watchlistSchema.index({ user: 1 });

module.exports = mongoose.model('Watchlist', watchlistSchema);
