const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'general' },
  status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', ticketSchema);