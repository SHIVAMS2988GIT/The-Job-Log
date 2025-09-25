// src/pages/AddJob.js
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Form.css";

export default function AddJob() {
  const [formData, setFormData] = useState({ company: "", role: "", status: "Applied" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/jobs", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("✅ Job added successfully! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Add Job error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "❌ Failed to add job.");
    }
  };

  return (
    <div className="form-container">
      <h2>Add New Job</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="company" placeholder="Company Name" value={formData.company} onChange={handleChange} required />
        <input type="text" name="role" placeholder="Role / Position" value={formData.role} onChange={handleChange} required />
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button type="submit">Add Job</button>
      </form>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}
