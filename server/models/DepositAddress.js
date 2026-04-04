const mongoose = require('mongoose');

const depositAddressSchema = new mongoose.Schema({
  coin: { 
    type: String, 
    required: true,
    uppercase: true 
  },
  symbol: { 
    type: String, 
    required: true,
    uppercase: true 
  },
  network: { 
    type: String, 
    default: 'MAINNET' 
  },
  address: { 
    type: String, 
    required: true 
  },
  memo: { 
    type: String 
  },
  qrCode: { 
    type: String 
  },
  qrBg: { 
    type: String, 
    default: '#ffffff' 
  },
  qrFg: { 
    type: String, 
    default: '#000000' 
  },
  minDeposit: { 
    type: Number, 
    default: 0 
  },
  maxDeposit: { 
    type: Number 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  fee: { 
    type: Number, 
    default: 0 
  },
  feeType: { 
    type: String, 
    enum: ['fixed', 'percent', 'none'], 
    default: 'none' 
  },
  createdBy: { 
    type: String, 
    default: 'superadmin' 
  },
  lastUpdatedBy: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

depositAddressSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('DepositAddress', depositAddressSchema);
