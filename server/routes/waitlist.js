import express from "express";
import Waitlist from "../models/Waitlist.js";

const router = express.Router();

// Join waitlist
router.post("/join", async (req, res) => {
    try {
        const { name, email, phone, company, message } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required",
            });
        }

        // Check if email already exists
        const existingEntry = await Waitlist.findOne({ email });
        if (existingEntry) {
            return res.status(400).json({
                success: false,
                message: "This email is already on the waitlist",
            });
        }

        // Create new waitlist entry
        const waitlistEntry = new Waitlist({
            name,
            email,
            phone,
            company,
            message,
        });

        await waitlistEntry.save();

        res.status(201).json({
            success: true,
            message: "Successfully joined the waitlist!",
            data: {
                name: waitlistEntry.name,
                email: waitlistEntry.email,
            },
        });
    } catch (error) {
        console.error("Waitlist join error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to join waitlist. Please try again.",
        });
    }
});

// Get all waitlist entries (optional - for admin)
router.get("/entries", async (req, res) => {
    try {
        const entries = await Waitlist.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            count: entries.length,
            data: entries,
        });
    } catch (error) {
        console.error("Fetch waitlist error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch waitlist entries",
        });
    }
});

export default router;
