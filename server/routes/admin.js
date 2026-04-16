import { Router } from "express";
import User from "../models/User.js";

const router = Router();

// Get all users (no authentication required)
router.get("/users", async (req, res) => {
    try {
        const users = await User.find()
            .select("-password -otp -otpExpiry -resetOtp -resetOtpExpiry")
            .sort({ createdAt: -1 });

        res.json({ users });
    } catch (err) {
        console.error("Fetch users error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
