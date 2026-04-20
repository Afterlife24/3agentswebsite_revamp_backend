import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import agentUsageRoutes from "./routes/agentUsage.js";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:3001",
  "http://localhost:3000",
  "https://autonomiq.ae",
  "https://www.autonomiq.ae",
  "https://autonomiq.co",
  "https://www.autonomiq.co",
  "https://admin.autonomiq.co",
  "https://userinfo.afterlife.org.in",
].filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/agent-usage", agentUsageRoutes);

// Mount auth routes at /api too so dashboard can reach /api/admin/users locally
app.use("/api", authRoutes);

app.get("/", (_, res) => res.json({ status: "ok" }));
app.get("/health", (_, res) => res.json({ status: "ok" }));
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

// Connect to MongoDB once (reused across Lambda invocations)
let isConnected = false;
export async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
  console.log("Connected to MongoDB");
}

// Only listen when running locally (not in Lambda)
if (!process.env.LAMBDA_TASK_ROOT) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`Auth server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    });
}

export default app;
