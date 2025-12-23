// Create new file: models/TemporaryBatch.js
import mongoose from "mongoose";

const temporaryBatchSchema = new mongoose.Schema({
  batchNo: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  medicineName: String,
  manufactureDate: Date,
  expiry: Date,
  formulation: String,
  manufacturer: String,
  pharmacy: String,
  quantity: Number,
  packaging: Object,
  status: String,
  blockchainVerified: {
    type: Boolean,
    default: false
  },
  blockchainTransactionHash: String,
  blockchainBlockNumber: Number,
  syncedToMongo: {
    type: Boolean,
    default: false
  },
  syncAttempts: {
    type: Number,
    default: 0
  },
  syncError: String,
  lastSyncAttempt: Date
}, {
  timestamps: true
});

// Index for efficient syncing
temporaryBatchSchema.index({ syncedToMongo: 1, createdAt: 1 });
temporaryBatchSchema.index({ batchNo: 1 }, { unique: true });

export default mongoose.model("TemporaryBatch", temporaryBatchSchema);