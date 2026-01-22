import mongoose from "mongoose";

const manufacturerCompanySchema = new mongoose.Schema({
  companyName: {
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
  // MetaMask Connection Fields
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
    connectionMethod: String, // 'manual' or 'metamask'
    verified: {
      type: Boolean,
      default: false
    },
    signature: String // For verification
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
  contactEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  specialties: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
manufacturerCompanySchema.index({ companyName: 1 });
manufacturerCompanySchema.index({ licenseNumber: 1 });
manufacturerCompanySchema.index({ contactEmail: 1 });
manufacturerCompanySchema.index({ isActive: 1 });

const ManufacturerCompany = mongoose.model("ManufacturerCompany", manufacturerCompanySchema);

export default ManufacturerCompany;