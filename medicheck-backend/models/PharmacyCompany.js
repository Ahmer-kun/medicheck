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
  // 🔥 MetaMask Connection Fields (same as manufacturer)
  metamaskConnected: {
    type: Boolean,
    default: false
  },
  blockchainAddress: {
    type: String,
    trim: true,
    lowercase: true,
    default: "",
    validate: {
      validator: function(v) {
        return v === "" || /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid Ethereum address'
    }
  },
  metamaskConnectionData: {
    connectedAt: Date,
    lastVerified: Date,
    connectionMethod: String,
    verified: {
      type: Boolean,
      default: false
    },
    signature: String
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