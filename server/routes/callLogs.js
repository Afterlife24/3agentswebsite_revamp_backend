import express from "express";
import CallLog from "../models/CallLog.js";

const router = express.Router();

// Create or update a call log
router.post("/log", async (req, res) => {
    try {
        const { callId, phoneNumber, roomName, startTime, endTime, status, transcript, language, metadata, leadScoring } = req.body;

        if (!callId || !phoneNumber || !roomName) {
            return res.status(400).json({ error: "callId, phoneNumber, and roomName are required" });
        }

        // Check if call log already exists
        let callLog = await CallLog.findOne({ callId });

        if (callLog) {
            // Update existing call log
            if (endTime) callLog.endTime = new Date(endTime);
            if (startTime) callLog.startTime = new Date(startTime);
            if (status) callLog.status = status;
            if (language) callLog.language = language;
            if (metadata) callLog.metadata = { ...callLog.metadata, ...metadata };
            if (leadScoring) callLog.leadScoring = { ...callLog.leadScoring, ...leadScoring };

            // Calculate duration if endTime is provided
            if (callLog.endTime && callLog.startTime) {
                callLog.duration = Math.floor((callLog.endTime - callLog.startTime) / 1000);
            }

            // Append transcript if provided
            if (transcript && Array.isArray(transcript)) {
                callLog.transcript.push(...transcript);
            }

            await callLog.save();
        } else {
            // Create new call log
            callLog = new CallLog({
                callId,
                phoneNumber,
                roomName,
                startTime: startTime ? new Date(startTime) : new Date(),
                endTime: endTime ? new Date(endTime) : null,
                status: status || "ongoing",
                transcript: transcript || [],
                language: language || "en",
                metadata: metadata || {},
                leadScoring: leadScoring || {}
            });

            await callLog.save();
        }

        res.status(200).json({ success: true, callLog });
    } catch (error) {
        console.error("Error logging call:", error);
        res.status(500).json({ error: "Failed to log call" });
    }
});

// Get all call logs (with pagination and filtering)
router.get("/logs", async (req, res) => {
    try {
        const { phoneNumber, status, page = 1, limit = 50 } = req.query;

        const filter = {};
        if (phoneNumber) filter.phoneNumber = phoneNumber;
        if (status) filter.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const callLogs = await CallLog.find(filter)
            .sort({ startTime: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await CallLog.countDocuments(filter);

        res.status(200).json({
            success: true,
            callLogs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error("Error fetching call logs:", error);
        res.status(500).json({ error: "Failed to fetch call logs" });
    }
});

// Get call log by callId
router.get("/logs/:callId", async (req, res) => {
    try {
        const { callId } = req.params;
        const callLog = await CallLog.findOne({ callId });

        if (!callLog) {
            return res.status(404).json({ error: "Call log not found" });
        }

        res.status(200).json({ success: true, callLog });
    } catch (error) {
        console.error("Error fetching call log:", error);
        res.status(500).json({ error: "Failed to fetch call log" });
    }
});

// Get conversations grouped by phone number (similar to WhatsApp dashboard)
router.get("/conversations", async (req, res) => {
    try {
        const conversations = await CallLog.aggregate([
            {
                $sort: { startTime: -1 }
            },
            {
                $group: {
                    _id: "$phoneNumber",
                    lastCallTime: { $first: "$startTime" },
                    totalCalls: { $sum: 1 },
                    lastStatus: { $first: "$status" },
                    lastCallId: { $first: "$callId" },
                    lastLanguage: { $first: "$language" }
                }
            },
            {
                $project: {
                    phoneNumber: "$_id",
                    lastCallTime: 1,
                    totalCalls: 1,
                    lastStatus: 1,
                    lastCallId: 1,
                    lastLanguage: 1,
                    _id: 0
                }
            },
            {
                $sort: { lastCallTime: -1 }
            }
        ]);

        res.status(200).json({ success: true, conversations });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
});

// Get all calls for a specific phone number
router.get("/conversations/:phoneNumber", async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        const calls = await CallLog.find({ phoneNumber }).sort({ startTime: -1 });

        res.status(200).json({ success: true, calls });
    } catch (error) {
        console.error("Error fetching calls for phone number:", error);
        res.status(500).json({ error: "Failed to fetch calls" });
    }
});

// Update message sent status for a call
router.post("/update-message-status", async (req, res) => {
    try {
        const { callId, channel, status } = req.body;

        if (!callId || !channel) {
            return res.status(400).json({ error: "callId and channel are required" });
        }

        const callLog = await CallLog.findOne({ callId });

        if (!callLog) {
            return res.status(404).json({ error: "Call log not found" });
        }

        callLog.messageSent = {
            channel: channel,
            sentAt: new Date(),
            status: status || "sent"
        };

        await callLog.save();

        res.status(200).json({ success: true, callLog });
    } catch (error) {
        console.error("Error updating message status:", error);
        res.status(500).json({ error: "Failed to update message status" });
    }
});

export default router;
