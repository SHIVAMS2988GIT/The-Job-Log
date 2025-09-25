const express = require("express");
const cors = require("cors"); // Import cors
require("dotenv").config();

const app = express();

// Middleware
app.use(cors()); // Allow requests from your frontend
app.use(express.json()); // Allow app to accept JSON

// Routes
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");

// Mount routes
app.use("/auth", authRoutes);
app.use("/jobs", jobRoutes);

app.listen(5000, () => {
  console.log("✅ Server running on port 5000");
});