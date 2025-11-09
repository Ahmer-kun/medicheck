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
    enum: ['Tablets', 'Capsules', 'Syrup', 'Injection', 'Ointment', 'Inhaler', 'Drops', 'Cream']
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
    enum: ['Active', 'In Transit', 'At Pharmacy', 'Expired', 'Sold'],
    default: 'Active'
  },
  pharmacyCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PharmacyCompany',
    required: true
  },
  blockchainVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
pharmacyMedicineSchema.index({ batchNo: 1 });
pharmacyMedicineSchema.index({ pharmacyCompany: 1 });
pharmacyMedicineSchema.index({ expiryDate: 1 });

// Virtual for pharmacy name
pharmacyMedicineSchema.virtual('pharmacyName').get(function() {
  return this.pharmacyCompany?.name || 'Unknown Pharmacy';
});

export default mongoose.model("PharmacyMedicine", pharmacyMedicineSchema);

// import mongoose from "mongoose";

// const pharmacyMedicineSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   batchNo: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   medicineName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   manufactureDate: {
//     type: Date,
//     required: true
//   },
//   expiryDate: {
//     type: Date,
//     required: true
//   },
//   formulation: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   },
//   manufacturer: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   pharmacyCompany: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'PharmacyCompany',
//     required: true
//   },
//   pharmacyName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   status: {
//     type: String,
//     enum: ['Active', 'In Transit', 'At Pharmacy', 'Expired'],
//     default: 'Active'
//   },
//   blockchainVerified: {
//     type: Boolean,
//     default: false
//   }
// }, {
//   timestamps: true
// });

// // Compound index for unique batch per pharmacy
// pharmacyMedicineSchema.index({ batchNo: 1, pharmacyCompany: 1 }, { unique: true });

// // Other indexes
// pharmacyMedicineSchema.index({ status: 1 });
// pharmacyMedicineSchema.index({ expiryDate: 1 });
// pharmacyMedicineSchema.index({ pharmacyCompany: 1 });
// pharmacyMedicineSchema.index({ manufacturer: 1 });

// const PharmacyMedicine = mongoose.model("PharmacyMedicine", pharmacyMedicineSchema);

// export default PharmacyMedicine;




// // models/PharmacyMedicine.js
// import mongoose from "mongoose";

// const pharmacyMedicineSchema = new mongoose.Schema({
//   name: { 
//     type: String, 
//     required: true,
//     trim: true
//   },
//   batchNo: { 
//     type: String, 
//     required: true, 
//     unique: true,
//     trim: true
//   },
//   medicineName: { 
//     type: String, 
//     required: true,
//     trim: true
//   },
//   manufactureDate: { 
//     type: Date, 
//     required: true 
//   },
//   expiryDate: { 
//     type: Date, 
//     required: true 
//   },
//   formulation: { 
//     type: String,
//     required: true,
//     trim: true
//   },
//   quantity: { 
//     type: Number, 
//     required: true,
//     min: 0
//   },
//   manufacturer: { 
//     type: String,
//     required: true,
//     trim: true
//   },
//   pharmacy: { 
//     type: String,
//     default: "Pharmacy",
//     trim: true
//   },
//   status: { 
//     type: String, 
//     default: "Active",
//     enum: ["Active", "In Transit", "Expired", "Out of Stock"]
//   },
//   blockchainVerified: { 
//     type: Boolean, 
//     default: false 
//   }
// }, {
//   timestamps: true
// });

// // Index for better query performance
// pharmacyMedicineSchema.index({ batchNo: 1 });
// pharmacyMedicineSchema.index({ pharmacy: 1 });
// pharmacyMedicineSchema.index({ status: 1 });

// // Check if model already exists before creating
// const PharmacyMedicine = mongoose.models.PharmacyMedicine || 
//   mongoose.model("PharmacyMedicine", pharmacyMedicineSchema);

// export default PharmacyMedicine;
