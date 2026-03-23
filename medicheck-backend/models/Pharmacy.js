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
