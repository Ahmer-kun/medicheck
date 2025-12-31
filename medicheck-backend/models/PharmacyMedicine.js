import mongoose from "mongoose";

const pharmacyMedicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  batchNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  medicineName: {
    type: String,
    required: true,
    trim: true
  },
  manufactureDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  formulation: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'In Transit', 'At Pharmacy', 'Expired', 'Sold', 'In Stock'],
    default: 'Active'
  },
  pharmacyCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PharmacyCompany',
    required: true
  },
  pharmacyName: {
    type: String,
    trim: true
  },
  acceptedFromManufacturer: {
    type: Boolean,
    default: false
  },
  acceptanceDate: {
    type: Date
  },
  blockchainVerified: {
    type: Boolean,
    default: false
  },
  dualStorageStatus: {
    type: String,
    enum: ['pending', 'completed', 'blockchain_failed', 'mongodb_failed'],
    default: 'pending'
  },
  dualStorageError: String,
  blockchainTransactionHash: String,
  blockchainBlockNumber: Number,
  blockchainError: String,
}, {
  timestamps: true
});

// Index for better query performance
pharmacyMedicineSchema.index({ batchNo: 1 });
pharmacyMedicineSchema.index({ pharmacyCompany: 1 });
pharmacyMedicineSchema.index({ expiryDate: 1 });
pharmacyMedicineSchema.index({ acceptanceDate: -1 });

export default mongoose.model("PharmacyMedicine", pharmacyMedicineSchema);