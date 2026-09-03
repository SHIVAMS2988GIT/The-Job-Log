import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import "./Form.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    setLoading(true);
    try {
      await api.post("/auth/signup", { name: form.name, email: form.email, password: form.password });
      toast.success("Account created. Please sign in.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to create your account.");
    } finally { setLoading(false); }
  };

  return <div className="auth-page"><div className="auth-card">
    <div className="auth-brand">💼 The Job Log</div>
    <h1 className="auth-title">Create your account</h1>
    <p className="auth-subtitle">Start building your personal job application tracker.</p>
    <form className="auth-form" onSubmit={submit}>
      <div className="field"><label htmlFor="name">Full name</label><input id="name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} autoComplete="name" required minLength="2" maxLength="100" /></div>
      <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} autoComplete="email" required /></div>
      <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} autoComplete="new-password" required minLength="8" /></div>
      <div className="field"><label htmlFor="confirmPassword">Confirm password</label><input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e)=>setForm({...form,confirmPassword:e.target.value})} autoComplete="new-password" required /></div>
      <button className="btn-primary" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
    </form>
    {error && <div className="error-message">{error}</div>}
    <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
  </div></div>;
}
