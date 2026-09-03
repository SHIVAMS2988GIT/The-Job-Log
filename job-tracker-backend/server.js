require("dotenv").config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set and contain at least 32 characters.");
}

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");

const app = express();
const PORT = Number(process.env.PORT || 5000);
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS origin not allowed"));
  },
  credentials: false,
}));
app.use(express.json({ limit: "100kb" }));

const authAttempts = new Map();
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_LIMIT = 30;

function authRateLimit(req, res, next) {
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const record = authAttempts.get(key);
  if (!record || now - record.startedAt > AUTH_WINDOW_MS) {
    authAttempts.set(key, { startedAt: now, count: 1 });
    return next();
  }
  record.count += 1;
  if (record.count > AUTH_LIMIT) {
    return res.status(429).json({ error: "Too many authentication attempts. Please try again later." });
  }
  return next();
}


app.get("/", (req, res) => res.json({ name: "The Job Log API", status: "running" }));
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.json({ status: "ok", database: "connected" });
  } catch (error) {
    return res.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.use("/auth", authRateLimit, authRoutes);
app.use("/jobs", jobRoutes);

app.use((req, res) => res.status(404).json({ error: "Route not found." }));

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  if (error.message === "CORS origin not allowed") {
    return res.status(403).json({ error: "Origin not allowed." });
  }
  return res.status(500).json({ error: "Internal server error." });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`The Job Log API running on port ${PORT}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
