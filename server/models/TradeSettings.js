const mongoose = require('mongoose');

const durationSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  label: { type: String, required: true },
  returnPercent: { type: Number, required: true },
  risk: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  isActive: { type: Boolean, default: true }
}, { _id: false });

const tradeSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'trade_settings' },
  durations: [durationSchema],
  leverage: {
    min: { type: Number, default: 1 },
    max: { type: Number, default: 10 },
    default: { type: Number, default: 1 },
    steps: [{ type: Number, default: [1, 2, 5, 10] }]
  },
  fees: {
    tradingFee: { type: Number, default: 0.1 },
    withdrawalFee: { type: Number, default: 0 },
    depositFee: { type: Number, default: 0 }
  },
  limits: {
    minTradeAmount: { type: Number, default: 10 },
    maxTradeAmount: { type: Number, default: 10000 },
    maxDailyTrades: { type: Number, default: 100 }
  },
  isEnabled: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

tradeSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne({ key: 'trade_settings' });
  if (!settings) {
    settings = await this.create({
      key: 'trade_settings',
      durations: [
        { value: 30, label: '30s', returnPercent: 0.76, risk: 'low', isActive: true },
        { value: 60, label: '1m', returnPercent: 1.53, risk: 'low', isActive: true },
        { value: 180, label: '3m', returnPercent: 4.59, risk: 'medium', isActive: true },
        { value: 300, label: '5m', returnPercent: 7.66, risk: 'medium', isActive: true },
        { value: 600, label: '10m', returnPercent: 15.35, risk: 'high', isActive: true }
      ],
      leverage: {
        min: 1,
        max: 10,
        default: 1,
        steps: [1, 2, 5, 10]
      },
      fees: {
        tradingFee: 0.1,
        withdrawalFee: 0,
        depositFee: 0
      },
      limits: {
        minTradeAmount: 10,
        maxTradeAmount: 10000,
        maxDailyTrades: 100
      }
    });
  }
  return settings;
};

module.exports = mongoose.model('TradeSettings', tradeSettingsSchema);
