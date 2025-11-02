const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchNo: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  medicineName: {
    type: String,
    required: true
  },
  formulation: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  manufacturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pharmacy: {
    type: String,
    default: 'To be assigned'
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  manufactureDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'recalled'],
    default: 'active'
  },
  blockchainVerified: {
    type: Boolean,
    default: false
  },
  blockchainTxHash: {
    type: String
  }
}, {
  timestamps: true
});

batchSchema.index({ batchNo: 1 });
batchSchema.index({ manufacturerId: 1 });
batchSchema.index({ expiryDate: 1 });

module.exports = mongoose.model('Batch', batchSchema);