// models/BatchTransfer.js
import mongoose from "mongoose";

const batchTransferSchema = new mongoose.Schema({
  batchNo: {
    type: String,
    required: true
  },
  fromManufacturer: {
    type: String,
    required: true
  },
  toPharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PharmacyCompany'
  },
  pharmacyName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  transferDate: {
    type: Date,
    default: Date.now
  },
  transferredBy: {
    type: String,
    required: true
  },
  blockchainTransactionHash: String
}, {
  timestamps: true
});

export default mongoose.model("BatchTransfer", batchTransferSchema);