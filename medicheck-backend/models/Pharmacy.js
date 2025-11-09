// const mongoose = require('mongoose');

// const pharmacySchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   location: {
//     type: String,
//     required: true
//   },
//   manager: {
//     type: String,
//     required: true
//   },
//   contact: {
//     email: String,
//     phone: String
//   },
//   stats: {
//     totalBatches: {
//       type: Number,
//       default: 0
//     },
//     activeBatches: {
//       type: Number,
//       default: 0
//     },
//     expiredBatches: {
//       type: Number,
//       default: 0
//     }
//   },
//   rating: {
//     type: Number,
//     default: 0
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('Pharmacy', pharmacySchema);





import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  contact: { type: String },
  batches: [
    {
      batchNo: String,
      status: String,
    },
  ],
});

const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);

export default Pharmacy;
