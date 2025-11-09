import mongoose from "mongoose";

const pharmacyCompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: {
      type: String,
      default: "Pakistan"
    },
    zipCode: String
  },
  contact: {
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  },
  manager: {
    type: String,
    required: true,
    trim: true
  },
  establishedDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  specialties: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for better query performance
pharmacyCompanySchema.index({ name: 1 });
pharmacyCompanySchema.index({ licenseNumber: 1 });
pharmacyCompanySchema.index({ "contact.email": 1 });
pharmacyCompanySchema.index({ isActive: 1 });

const PharmacyCompany = mongoose.model("PharmacyCompany", pharmacyCompanySchema);

export default PharmacyCompany;