import { Router } from "express";
import AgentUsage from "../models/AgentUsage.js";

const router = Router();

// ─── LOG AGENT USAGE ───
router.post("/log", async (req, res) => {
  try {
    const { userEmail, userName, agentType } = req.body;
    if (!userEmail || !agentType) {
      return res.status(400).json({ error: "userEmail and agentType are required" });
    }
    if (!["web", "calling", "whatsapp"].includes(agentType)) {
      return res.status(400).json({ error: "agentType must be web, calling, or whatsapp" });
    }

    const usage = await AgentUsage.create({ userEmail, userName, agentType });
    res.status(201).json({ message: "Usage logged", id: usage._id });
  } catch (err) {
    console.error("Agent usage log error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET ALL AGENT USAGE (for dashboard) ───
router.get("/summary", async (req, res) => {
  try {
    // Per-user, per-agent counts
    const perUser = await AgentUsage.aggregate([
      {
        $group: {
          _id: { userEmail: "$userEmail", agentType: "$agentType" },
          userName: { $last: "$userName" },
          count: { $sum: 1 },
          lastUsed: { $max: "$createdAt" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Total counts per agent
    const totals = await AgentUsage.aggregate([
      {
        $group: {
          _id: "$agentType",
          count: { $sum: 1 },
        },
      },
    ]);

    // All individual logs (sorted by most recent first)
    const allLogs = await AgentUsage.find()
      .sort({ createdAt: -1 })
      .select("userEmail userName agentType createdAt");

    res.json({ perUser, totals, allLogs });
  } catch (err) {
    console.error("Agent usage summary error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
