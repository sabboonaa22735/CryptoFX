const mongoose = require('mongoose');

const depositSettingsSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true,
    default: 'deposit_settings'
  },
  isEnabled: { 
    type: Boolean, 
    default: true 
  },
  maintenanceMode: { 
    type: Boolean, 
    default: false 
  },
  maintenanceMessage: {
    type: String,
    default: 'Deposits are temporarily unavailable. Please try again later.'
  },
  general: {
    minDeposit: { type: Number, default: 10 },
    maxDeposit: { type: Number, default: 100000 },
    defaultCurrency: { type: String, default: 'USD' },
    autoApproveDeposits: { type: Boolean, default: false },
    requireProofOfPayment: { type: Boolean, default: true },
    paymentTimeoutMinutes: { type: Number, default: 30 },
  },
  fees: {
    depositFeeType: { type: String, enum: ['none', 'fixed', 'percent'], default: 'none' },
    depositFee: { type: Number, default: 0 },
    depositFeePercent: { type: Number, default: 0 },
  },
  coins: {
    BTC: {
      isEnabled: { type: Boolean, default: true },
      minDeposit: { type: Number, default: 0.0001 },
      maxDeposit: { type: Number },
      networkFee: { type: Number, default: 0.0001 },
      confirmations: { type: Number, default: 3 },
      customLabel: { type: String },
      customDescription: { type: String },
    },
    ETH: {
      isEnabled: { type: Boolean, default: true },
      minDeposit: { type: Number, default: 0.001 },
      maxDeposit: { type: Number },
      networkFee: { type: Number, default: 0.005 },
      confirmations: { type: Number, default: 12 },
      customLabel: { type: String },
      customDescription: { type: String },
    },
    USDT: {
      isEnabled: { type: Boolean, default: true },
      minDeposit: { type: Number, default: 10 },
      maxDeposit: { type: Number },
      networkFee: { type: Number, default: 1 },
      confirmations: { type: Number, default: 6 },
      customLabel: { type: String },
      customDescription: { type: String },
    },
    SOL: {
      isEnabled: { type: Boolean, default: true },
      minDeposit: { type: Number, default: 0.01 },
      maxDeposit: { type: Number },
      networkFee: { type: Number, default: 0.00025 },
      confirmations: { type: Number, default: 1 },
      customLabel: { type: String },
      customDescription: { type: String },
    },
    XRP: {
      isEnabled: { type: Boolean, default: true },
      minDeposit: { type: Number, default: 10 },
      maxDeposit: { type: Number },
      networkFee: { type: Number, default: 1 },
      confirmations: { type: Number, default: 1 },
      customLabel: { type: String },
      customDescription: { type: String },
    },
    BNB: {
      isEnabled: { type: Boolean, default: true },
      minDeposit: { type: Number, default: 0.01 },
      maxDeposit: { type: Number },
      networkFee: { type: Number, default: 0.001 },
      confirmations: { type: Number, default: 1 },
      customLabel: { type: String },
      customDescription: { type: String },
    },
    ADA: {
      isEnabled: { type: Boolean, default: true },
      minDeposit: { type: Number, default: 10 },
      maxDeposit: { type: Number },
      networkFee: { type: Number, default: 1 },
      confirmations: { type: Number, default: 1 },
      customLabel: { type: String },
      customDescription: { type: String },
    },
    DOGE: {
      isEnabled: { type: Boolean, default: true },
      minDeposit: { type: Number, default: 100 },
      maxDeposit: { type: Number },
      networkFee: { type: Number, default: 10 },
      confirmations: { type: Number, default: 1 },
      customLabel: { type: String },
      customDescription: { type: String },
    },
    DOT: {
      isEnabled: { type: Boolean, default: true },
      minDeposit: { type: Number, default: 10 },
      maxDeposit: { type: Number },
      networkFee: { type: Number, default: 1 },
      confirmations: { type: Number, default: 1 },
      customLabel: { type: String },
      customDescription: { type: String },
    },
    AVAX: {
      isEnabled: { type: Boolean, default: true },
      minDeposit: { type: Number, default: 1 },
      maxDeposit: { type: Number },
      networkFee: { type: Number, default: 0.025 },
      confirmations: { type: Number, default: 1 },
      customLabel: { type: String },
      customDescription: { type: String },
    },
    MATIC: {
      isEnabled: { type: Boolean, default: true },
      minDeposit: { type: Number, default: 10 },
      maxDeposit: { type: Number },
      networkFee: { type: Number, default: 1 },
      confirmations: { type: Number, default: 1 },
      customLabel: { type: String },
      customDescription: { type: String },
    },
    LINK: {
      isEnabled: { type: Boolean, default: true },
      minDeposit: { type: Number, default: 10 },
      maxDeposit: { type: Number },
      networkFee: { type: Number, default: 0.5 },
      confirmations: { type: Number, default: 1 },
      customLabel: { type: String },
      customDescription: { type: String },
    },
  },
  ui: {
    primaryColor: { type: String, default: '#f59e0b' },
    secondaryColor: { type: String, default: '#d97706' },
    showTimer: { type: Boolean, default: true },
    showProgressSteps: { type: Boolean, default: true },
    showQRCode: { type: Boolean, default: true },
    showFeeInfo: { type: Boolean, default: true },
    showNetworkInfo: { type: Boolean, default: true },
    confirmButtonText: { type: String, default: 'Confirm Deposit' },
    successMessage: { type: String, default: 'Deposit submitted successfully! Waiting for admin approval.' },
    headerTitle: { type: String, default: 'Deposit Crypto' },
    headerSubtitle: { type: String, default: 'Select cryptocurrency to deposit' },
  },
  messages: {
    welcomeTitle: { type: String, default: 'Deposit {amount} {symbol}' },
    welcomeSubtitle: { type: String, default: 'Send the exact amount to complete your deposit' },
    warningText: { type: String, default: 'Only send {symbol} to this address. Sending other assets may result in permanent loss.' },
    successTitle: { type: String, default: 'Deposit Complete' },
    successSubtitle: { type: String, default: 'Your deposit has been approved successfully!' },
    pendingTitle: { type: String, default: 'Waiting for Approval' },
    pendingSubtitle: { type: String, default: 'Your deposit is being reviewed by our team' },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

depositSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

depositSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne({ key: 'deposit_settings' });
  if (!settings) {
    settings = new this({ key: 'deposit_settings' });
    await settings.save();
  }
  return settings;
};

module.exports = mongoose.model('DepositSettings', depositSettingsSchema);
