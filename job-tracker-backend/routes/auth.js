const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const cleanName = (name) => String(name || "").trim();

function validateRegistration({ name, email, password }) {
  if (name.length < 2 || name.length > 100) return "Name must be between 2 and 100 characters.";
  if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email address.";
  if (password.length < 8 || password.length > 72) return "Password must be between 8 and 72 characters.";
  return null;
}

router.post("/signup", async (req, res, next) => {
  try {
    const name = cleanName(req.body.name);
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    const validationError = validateRegistration({ name, email, password });

    if (validationError) return res.status(400).json({ error: validationError });

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );

    return res.status(201).json({
      message: "Account created successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const result = await pool.query(
      "SELECT id, name, email, password FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1 LIMIT 1",
      [req.user.userId]
    );

    if (!result.rows[0]) return res.status(404).json({ error: "User not found." });
    return res.json({ user: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
