const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    // ✨ IMPROVEMENT: Use 201 status for successful creation
    res.status(201).json({
      message: "User created successfully",
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error("Signup error:", err);
    // ✨ IMPROVEMENT: Send error back as JSON for consistency
    res.status(500).json({ error: "Server error during signup" });
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

   const token = jwt.sign(
  { 
    userId: user.rows[0].id, 
    name: user.rows[0].name, 
    email: user.rows[0].email // ✨ Add the email here
  },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    // ✨ IMPROVEMENT: Send error back as JSON for consistency
    res.status(500).json({ error: "Server error during login" });
  }
});

module.exports = router;