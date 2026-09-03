import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import { saveSession } from "../auth";
import "./Form.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      saveSession(data.token, data.user);
      toast.success("Welcome back!");
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Unable to login. Please try again.");
    } finally { setLoading(false); }
  };

  return <div className="auth-page"><div className="auth-card">
    <div className="auth-brand">💼 The Job Log</div>
    <h1 className="auth-title">Welcome back</h1>
    <p className="auth-subtitle">Track your applications and keep your job search organized.</p>
    <form className="auth-form" onSubmit={submit}>
      <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required /></div>
      <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} required /></div>
      <button className="btn-primary" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
    </form>
    {error && <div className="error-message">{error}</div>}
    <p className="auth-footer">Don't have an account? <Link to="/register">Create one</Link></p>
  </div></div>;
}
