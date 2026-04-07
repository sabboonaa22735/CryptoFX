const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdrawal', 'trade', 'bonus'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'rejected'], default: 'completed' },
  method: { type: String },
  reference: { type: String },
  coinSymbol: { type: String },
  walletAddress: { type: String },
  proofOfPayment: { type: String },
  proofOfPaymentUrl: { type: String },
  proofFilename: { type: String },
  adminNote: { type: String },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);