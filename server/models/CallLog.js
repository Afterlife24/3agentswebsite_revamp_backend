import mongoose from "mongoose";

const callLogSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true, trim: true },
    callId: { type: String, required: true, unique: true },
    roomName: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number }, // in seconds
    status: { type: String, enum: ["ongoing", "completed", "failed"], default: "ongoing" },
    transcript: [
        {
            role: { type: String, enum: ["user", "agent", "assistant"] },
            text: { type: String },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    language: { type: String, default: "en" },
    metadata: {
        participantIdentity: { type: String },
        callDirection: { type: String, enum: ["inbound", "outbound"], default: "inbound" }
    },
    messageSent: {
        channel: { type: String, enum: ["whatsapp", "sms", "none"], default: "none" },
        sentAt: { type: Date },
        status: { type: String, enum: ["sent", "failed"] }
    },
    leadScoring: {
        totalScore: { type: Number, default: 0 },
        priority: { type: String, enum: ["HOT", "WARM", "COOL", "LOW"], default: "LOW" },
        businessType: { type: String },
        customerChannels: [{ type: String }],
        painPoints: [{ type: String }],
        timeline: { type: String },
        confidenceSignals: [{ type: String }],
        recommendedSolution: { type: String },
        breakdown: {
            businessType: { type: Number, default: 0 },
            channels: { type: Number, default: 0 },
            painPoints: { type: Number, default: 0 },
            timeline: { type: Number, default: 0 },
            confidenceSignals: { type: Number, default: 0 }
        }
    }
}, { timestamps: true });

// Index for faster queries
callLogSchema.index({ phoneNumber: 1, startTime: -1 });
callLogSchema.index({ callId: 1 });

export default mongoose.model("CallLog", callLogSchema);
