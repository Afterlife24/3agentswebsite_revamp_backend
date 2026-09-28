import express from "express";

const router = express.Router();

// Simple single-credential dashboard login.
// Credentials are hardcoded here server-side.
// NOTE: This is a lightweight gate, not full authentication.
const DASHBOARD_USERNAME = "admin@autonomiq.ae";
const DASHBOARD_PASSWORD = "Autonomiq@2025";

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (username === DASHBOARD_USERNAME && password === DASHBOARD_PASSWORD) {
    // Return a simple opaque token. No JWT/session for now — just a marker.
    return res.json({
      success: true,
      token: "dashboard-authenticated",
      user: { username: DASHBOARD_USERNAME },
    });
  }

  return res
    .status(401)
    .json({ success: false, error: "Invalid username or password" });
});

export default router;
