import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: {
    type: String,
    enum: ["admin", "pharmacy", "manufacturer", "viewer", "analytics"],
    required: true,
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true
  },
  phone: {
    type: String,
    trim: true
  },
  cnic: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  address: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deactivatedAt: {
    type: Date
  },
  deactivatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reactivatedAt: {
    type: Date
  },
  reactivatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better performance
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ cnic: 1 });

const User = mongoose.model("User", userSchema);

export default User;

