// src/pages/Dashboard.js
import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { FaTrash, FaBriefcase, FaCalendarAlt } from 'react-icons/fa'; // ✨ 1. IMPORT ICONS

import "./Dashboard.css";
import "./Form.css";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // ... (your existing useEffect for fetching data)
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const jobsPromise = axios.get("http://localhost:5000/jobs", { headers });
        const statsPromise = axios.get("http://localhost:5000/jobs/stats", { headers });
        const [jobsResponse, statsResponse] = await Promise.all([jobsPromise, statsPromise]);
        setJobs(jobsResponse.data);
        setStats(statsResponse.data);
      } catch (err) {
        toast.error("Failed to fetch data. Please login again.");
        setTimeout(() => navigate("/login"), 2000);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleDelete = async (id) => {
    // ... (your existing handleDelete function)
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(jobs.filter((job) => job.id !== id));
      toast.success("Job deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete job.");
    }
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard-container">
      {stats && (
        <div className="info-card">
          <h3>Welcome, {stats.user.name}</h3>
          <p>Email: {stats.user.email}</p>
          <p>Last Application: <strong>{stats.lastApplication.company}</strong></p>
        </div>
      )}

      <div className="form-container">
        <div className="dashboard-header">
            <h2>Your Jobs</h2>
            <Link to="/add-job" className="btn">Add Job</Link>
        </div>
        
        {/* ✨ 2. NEW JOB CARDS LAYOUT */}
        <div className="jobs-container">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="card-header">
                  <div className="company-logo">{job.company.charAt(0)}</div>
                  <div className="company-info">
                    <span className="job-role">{job.role}</span>
                    <span className="job-company">{job.company}</span>
                  </div>
                </div>
                <div className="card-body">
                  <div className={`status-badge ${job.status.toLowerCase()}`}>{job.status}</div>
                </div>
                <div className="card-footer">
                  <div className="date-info">
                    <FaCalendarAlt /> {new Date(job.date_applied).toLocaleDateString()}
                  </div>
                  <div className="action-buttons">
                    <button className="delete-btn" onClick={() => handleDelete(job.id)}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No jobs tracked yet. Add one to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
}