// src/pages/Register.js
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Form.css";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // ✅ Send entire formData
      const res = await axios.post("http://localhost:5000/auth/signup", formData);

      alert(res.data.message || "✅ Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err.response?.data || err.message);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "❌ Error registering. Try again."
      );
    }
  };

  return (
    <div className="form-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
      </form>

      {error && <p className="error">{error}</p>}

      <p>
        Already registered? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
