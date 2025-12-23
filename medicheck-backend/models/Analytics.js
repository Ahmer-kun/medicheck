// // Batch model (EDITED)
// import mongoose from "mongoose";

// const batchSchema = new mongoose.Schema({
//   batchNo: String,
//   name: String,
//   manufactureDate: String,
//   expiry: String,
//   formulation: String,
//   manufacturer: String,
//   pharmacy: String,
//   quantity: Number,
//   status: String,
//   blockchainVerified: Boolean
// });

// export default mongoose.model("Batch", batchSchema);



import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  metric: { type: String, required: true },
  value: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;



// import mongoose from "mongoose";

// const batchSchema = new mongoose.Schema({
//   id: { type: String, required: true }, 
//   name: { type: String, required: true },
//   expiry: { type: String, required: true },
//   stock: { type: Number, required: true },
//   supplier: { type: String, required: true },
// });

// export default mongoose.model("Batch", batchSchema);


// import mongoose from "mongoose";

// const batchSchema = new mongoose.Schema({
//   batchNo: String,
//   name: String,
//   manufacturer: String,
//   pharmacy: String,
//   manufactureDate: String,
//   expiry: String,
//   formulation: String,
//   quantity: Number,
//   blockchainVerified: { type: Boolean, default: false },
// });

// export default mongoose.model("Batch", batchSchema);
