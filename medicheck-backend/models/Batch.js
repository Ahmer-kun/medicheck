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
    type: Date 
  },
  expiry: { 
    type: Date 
  },
  formulation: { 
    type: String,
    trim: true
  },
  manufacturer: { 
    type: String,
    trim: true
  },
  pharmacy: { 
    type: String,
    trim: true
  },
  quantity: { 
    type: Number, 
    default: 0,
    min: 0
  },
  status: { 
    type: String, 
    default: "active",
    enum: ["active", "expired", "accepted", "manufactured"]
  },
  blockchainVerified: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});

// Index for better query performance
batchSchema.index({ batchNo: 1 });


batchSchema.index({ batchNo: 1 }, { unique: true });
batchSchema.index({ status: 1, expiry: 1 });
batchSchema.index({ manufacturer: 1 });
batchSchema.index({ createdAt: -1 });



const Batch = mongoose.model("Batch", batchSchema);

export default Batch;





// import mongoose from "mongoose";

// const batchSchema = new mongoose.Schema({
//   batchNo: { type: String, required: true, unique: true },
//   name: { type: String, required: true },
//   manufactureDate: { type: Date },
//   expiry: { type: Date },
//   formulation: { type: String },
//   manufacturer: { type: String },
//   pharmacy: { type: String },
//   quantity: { type: Number, default: 0 },
//   status: { type: String, default: "active" },
//   blockchainVerified: { type: Boolean, default: false },
// });

// const Batch = mongoose.model("Batch", batchSchema);

// export default Batch;




