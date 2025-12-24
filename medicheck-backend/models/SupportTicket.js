import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "pharmacy", "manufacturer", "viewer", "analytics"],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ["technical", "billing", "feature_request", "bug_report", "general", "account"],
    required: true
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  status: {
    type: String,
    enum: ["open", "in_progress", "resolved", "closed"],
    default: "open"
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  responses: [{
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    isAdminResponse: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastActivity when responses are added
supportTicketSchema.pre('save', function(next) {
  if (this.isModified('responses')) {
    this.lastActivity = new Date();
  }
  next();
});

// Index for better query performance
supportTicketSchema.index({ status: 1, priority: -1 });
supportTicketSchema.index({ user: 1 });
supportTicketSchema.index({ createdAt: -1 });
supportTicketSchema.index({ lastActivity: -1 });
supportTicketSchema.index({ assignedTo: 1 });

export default mongoose.model("SupportTicket", supportTicketSchema);
