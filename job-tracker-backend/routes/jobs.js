const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// GET all jobs for the logged-in user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      "SELECT * FROM jobs WHERE user_id = $1 ORDER BY date_applied DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// POST a new job for the logged-in user
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { company, role, status, notes } = req.body;
    const userId = req.user.userId;

    const newJob = await pool.query(
      "INSERT INTO jobs (user_id, company, role, status, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [userId, company, role, status, notes]
    );
    res.status(201).json(newJob.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE a job
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id: jobId } = req.params; // Get the job ID from the URL
    const userId = req.user.userId;  // Get the user ID from the token

    // This query ensures a user can only delete their own jobs
    const result = await pool.query(
      "DELETE FROM jobs WHERE id = $1 AND user_id = $2 RETURNING *",
      [jobId, userId]
    );

    // If no rows were returned, the job didn't exist or didn't belong to the user
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Job not found or user not authorized" });
    }

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});
// GET STATS - User info and last applied company
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    // This info now comes directly from the token thanks to our previous change
    const { name, email, userId } = req.user; 

    // Find the most recently created job for this user
    const lastJobRes = await pool.query(
      "SELECT company FROM jobs WHERE user_id = $1 ORDER BY id DESC LIMIT 1",
      [userId]
    );

    // Check if any jobs were found, otherwise set a default message
    const lastCompany = lastJobRes.rows.length > 0 ? lastJobRes.rows[0].company : "N/A";

    // Send all the information back to the frontend
    res.json({
      user: { name, email },
      lastApplication: { company: lastCompany },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;