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
    sparse: true // Allows multiple nulls but enforces uniqueness for non-null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better performance
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.model("User", userSchema);

export default User;


// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   password: { type: String, required: true },
//   role: {
//     type: String,
//     enum: ["admin", "pharmacist", "manufacturer", "viewer", "analytics"],
//     required: true,
//   },
// });

// const User = mongoose.model("User", userSchema);

// export default User;