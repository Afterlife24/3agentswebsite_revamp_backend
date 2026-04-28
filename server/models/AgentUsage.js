import mongoose from "mongoose";

const agentUsageSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, lowercase: true, trim: true },
  userName: { type: String, trim: true },
  agentType: {
    type: String,
    enum: ["web", "calling", "whatsapp"],
    required: true
  },
}, { timestamps: true });

// Index for fast lookups
agentUsageSchema.index({ userEmail: 1, agentType: 1 });
agentUsageSchema.index({ createdAt: -1 });

export default mongoose.model("AgentUsage", agentUsageSchema);
