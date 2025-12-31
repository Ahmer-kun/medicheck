import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({
  batchNo: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  medicineName: {
    type: String,
    trim: true
  },
  manufactureDate: { 
    type: Date,
    required: true
  },
  expiry: { 
    type: Date,
    required: true
  },
  formulation: { 
    type: String,
    required: true,
    trim: true
    // REMOVE or simplify enum here too
  },
  manufacturer: { 
    type: String,
    required: true,
    trim: true
  },
  pharmacy: { 
    type: String,
    trim: true
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 1
  },
  packaging: {
    packSize: {
      type: String,
      trim: true
    },
    unitType: {
      type: String,
      default: "units"
    }
  },
  status: { 
    type: String, 
    default: "active",
    enum: ["active", "expired", "accepted", "manufactured", "pending"]
  },
  blockchainVerified: { 
    type: Boolean, 
    default: false 
  },
  blockchainTransactionHash: String,
  blockchainBlockNumber: Number,
  // ✅ Add dual storage tracking
  dualStorageStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'rolled_back'],
    default: 'pending'
  },
  dualStorageError: String,
}, {
  timestamps: true
});

// Index for better query performance
batchSchema.index({ batchNo: 1 });
batchSchema.index({ status: 1, expiry: 1 });
batchSchema.index({ manufacturer: 1 });
batchSchema.index({ createdAt: -1 });


batchSchema.pre('save', async function(next) {
  // Check for duplicate batch number on creation
  if (this.isNew) {
    const existingBatch = await this.constructor.findOne({ 
      batchNo: this.batchNo,
      manufacturer: this.manufacturer 
    });
    
    if (existingBatch) {
      // If pharmacyCompanyId exists, it might be a legitimate duplicate (pharmacy copy)
      if (!this.pharmacyCompanyId && !existingBatch.pharmacyCompanyId) {
        const error = new Error(`Batch number ${this.batchNo} already exists for ${this.manufacturer}`);
        return next(error);
      }
    }
  }
  next();
});


const Batch = mongoose.model("Batch", batchSchema);

export default Batch;