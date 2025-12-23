// Create new file: models/BlockchainSyncQueue.js
import mongoose from "mongoose";

const blockchainSyncQueueSchema = new mongoose.Schema({
  batchNo: {
    type: String,
    required: true,
    unique: true
  },
  data: {
    type: Object,
    required: true
  },
  error: {
    type: String
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 5
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  lastAttempt: {
    type: Date
  },
  nextRetry: {
    type: Date
  },
  successData: {
    transactionHash: String,
    blockNumber: Number
  }
}, {
  timestamps: true
});

// Auto-retry logic
blockchainSyncQueueSchema.pre('save', function(next) {
  if (this.status === 'failed' && this.retryCount < this.maxRetries) {
    const delay = Math.min(300000, 5000 * Math.pow(2, this.retryCount)); // Exponential backoff
    this.nextRetry = new Date(Date.now() + delay);
    this.status = 'pending';
  }
  next();
});

export default mongoose.model("BlockchainSyncQueue", blockchainSyncQueueSchema);