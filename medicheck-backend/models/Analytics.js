import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  metric: { type: String, required: true },
  value: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;

