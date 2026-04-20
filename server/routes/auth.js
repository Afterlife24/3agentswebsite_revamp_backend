import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateOtp, sendOtpEmail } from "../utils/email.js";

const router = Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function userResponse(user, token) {
  return {
    token,
    user: {
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      provider: user.provider,
      isVerified: user.isVerified,
    },
  };
}

// ─── SIGNUP ───
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const otp = generateOtp();

    const user = await User.create({
      name,
      email,
      password: hashed,
      provider: "email",
      isVerified: false,
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOtpEmail(email, otp, "verify");

    const token = signToken(user);
    res.status(201).json(userResponse(user, token));
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── VERIFY OTP ───
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.isVerified) return res.json({ message: "Already verified" });
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = signToken(user);
    res.json(userResponse(user, token));
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── RESEND OTP ───
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.isVerified) return res.json({ message: "Already verified" });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(email, otp, "verify");
    res.json({ message: "OTP sent" });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── LOGIN ───
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.isVerified) {
      // Resend OTP automatically
      const otp = generateOtp();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await sendOtpEmail(email, otp, "verify");
      return res.status(403).json({ error: "Email not verified. A new OTP has been sent.", needsVerification: true });
    }

    const token = signToken(user);
    res.json(userResponse(user, token));
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GOOGLE LOGIN ───
router.post("/google", async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    let user = await User.findOne({ email });
    if (user) {
      // Update avatar if changed
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        avatar,
        provider: "google",
        isVerified: true,
      });
    }

    const token = signToken(user);
    res.json(userResponse(user, token));
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── FORGOT PASSWORD ───
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "No account with this email" });
    if (user.provider === "google" && !user.password) {
      return res.status(400).json({ error: "This account uses Google login. No password to reset." });
    }

    const otp = generateOtp();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(email, otp, "reset");
    res.json({ message: "Reset code sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── RESET PASSWORD ───
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ error: "Invalid reset code" });
    }
    if (user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ error: "Reset code has expired" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    const token = signToken(user);
    res.json(userResponse(user, token));
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── GET CURRENT USER (via token) ───
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token" });
    }
    const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password -otp -otpExpiry -resetOtp -resetOtpExpiry");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: { name: user.name, email: user.email, avatar: user.avatar, provider: user.provider, isVerified: user.isVerified } });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

// ─── ADMIN: GET ALL USERS ───
router.get("/admin/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -otp -otpExpiry -resetOtp -resetOtpExpiry")
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
