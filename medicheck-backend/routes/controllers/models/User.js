import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, enum: ["admin", "pharmacist", "manufacturer", "viewer", "analytics"] },
});

export default mongoose.model("User", userSchema);
