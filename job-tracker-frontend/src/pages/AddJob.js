import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import "./Form.css";

const initial = { company:"", role:"", status:"applied", date_applied:new Date().toISOString().slice(0,10), location:"", job_url:"", salary:"", recruiter:"", notes:"" };

export default function AddJob() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const update = (e) => setForm({...form, [e.target.name]: e.target.value});
  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await api.post("/jobs", form); toast.success("Application added!"); navigate("/dashboard"); }
    catch (err) { toast.error(err.response?.data?.error || "Failed to add application."); }
    finally { setLoading(false); }
  };
  return <JobForm title="Add a job application" subtitle="Save every opportunity in one place." form={form} update={update} submit={submit} loading={loading} />;
}

export function JobForm({ title, subtitle, form, update, submit, loading }) {
  return <div className="form-page"><div className="form-card">
    <div className="form-header"><h1>{title}</h1><p>{subtitle}</p></div>
    <form onSubmit={submit}>
      <div className="form-grid">
        <div className="field"><label>Company *</label><input name="company" value={form.company} onChange={update} required maxLength="150" placeholder="e.g. Microsoft" /></div>
        <div className="field"><label>Role *</label><input name="role" value={form.role} onChange={update} required maxLength="150" placeholder="e.g. Software Engineer" /></div>
        <div className="field"><label>Status *</label><select name="status" value={form.status} onChange={update}><option value="applied">Applied</option><option value="interview">Interview</option><option value="offer">Offer</option><option value="rejected">Rejected</option></select></div>
        <div className="field"><label>Date applied *</label><input type="date" name="date_applied" value={form.date_applied} onChange={update} required /></div>
        <div className="field"><label>Location</label><input name="location" value={form.location} onChange={update} maxLength="150" placeholder="Bengaluru / Remote" /></div>
        <div className="field"><label>Salary</label><input name="salary" value={form.salary} onChange={update} maxLength="100" placeholder="₹10–15 LPA" /></div>
        <div className="field"><label>Recruiter</label><input name="recruiter" value={form.recruiter} onChange={update} maxLength="150" placeholder="Recruiter name" /></div>
        <div className="field"><label>Job URL</label><input type="url" name="job_url" value={form.job_url} onChange={update} placeholder="https://..." /></div>
        <div className="field full"><label>Notes</label><textarea name="notes" value={form.notes} onChange={update} maxLength="5000" placeholder="Interview date, referral, next steps, notes..." /></div>
      </div>
      <div className="form-actions"><button className="btn-primary" disabled={loading}>{loading ? "Saving..." : "Save application"}</button><Link className="btn-secondary" to="/dashboard">Cancel</Link></div>
    </form>
  </div></div>;
}
