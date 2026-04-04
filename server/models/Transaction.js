const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdrawal', 'trade', 'bonus'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  method: { type: String },
  reference: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);