const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['user', 'deposit', 'withdrawal', 'trade', 'support', 'alert', 'system'],
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'type'
  }
}, {
  timestamps: true
});

adminNotificationSchema.index({ createdAt: -1 });
adminNotificationSchema.index({ read: 1 });

module.exports = mongoose.model('AdminNotification', adminNotificationSchema);