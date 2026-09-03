import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaBriefcase, FaCalendarAlt, FaChartLine, FaCheckCircle, FaEdit, FaExternalLinkAlt, FaSearch, FaTrash, FaUserTie } from "react-icons/fa";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api";
import { getStoredUser } from "../auth";
import LoadingSpinner from "../components/LoadingSpinner";
import "./Dashboard.css";

const labels = { applied:"Applied", interview:"Interview", offer:"Offer", rejected:"Rejected" };

function StatCard({ title, value, hint, icon }) {
  return <div className="stat-card"><div className="stat-icon">{icon}</div><div><p>{title}</p><strong>{value}</strong><span>{hint}</span></div></div>;
}

export default function Dashboard() {
  const user = getStoredUser();
  const [jobs, setJobs] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsRes, dashRes] = await Promise.all([
        api.get("/jobs", { params: { q: query, status, sort } }),
        api.get("/jobs/dashboard")
      ]);
      setJobs(jobsRes.data); setDashboard(dashRes.data);
    } catch (err) { toast.error(err.response?.data?.error || "Could not load your dashboard."); }
    finally { setLoading(false); }
  }, [query, status, sort]);

  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [load]);

  const deleteJob = async (id) => {
    if (!window.confirm("Delete this application? This cannot be undone.")) return;
    setDeleting(id);
    try { await api.delete(`/jobs/${id}`); toast.success("Application deleted."); await load(); }
    catch (err) { toast.error(err.response?.data?.error || "Failed to delete application."); }
    finally { setDeleting(null); }
  };

  const chartData = useMemo(() => (dashboard?.chartData || []).map((item) => ({...item, status: labels[item.status] || item.status})), [dashboard]);
  if (loading && !dashboard) return <LoadingSpinner label="Loading your job log..." />;

  const summary = dashboard?.summary || {};
  return <div className="dashboard">
    <section className="hero"><div><p className="eyebrow">YOUR JOB SEARCH HQ</p><h1>Welcome back, {user?.name?.split(" ")[0] || "there"} 👋</h1><p>Track applications, follow your progress, and stay on top of every opportunity.</p></div><Link to="/add-job" className="hero-button">+ Add application</Link></section>

    <section className="stats-grid">
      <StatCard title="Total applications" value={summary.total || 0} hint={`${summary.last30Days || 0} in last 30 days`} icon={<FaBriefcase />} />
      <StatCard title="Interviews" value={summary.interviews || 0} hint={`${summary.interviewRate || 0}% interview rate`} icon={<FaCalendarAlt />} />
      <StatCard title="Offers" value={summary.offers || 0} hint={`${summary.offerRate || 0}% offer rate`} icon={<FaCheckCircle />} />
      <StatCard title="Rejected" value={summary.rejected || 0} hint="Keep applying — momentum matters" icon={<FaChartLine />} />
    </section>

    <section className="analytics-grid">
      <div className="panel chart-panel"><div className="panel-heading"><div><h2>Application pipeline</h2><p>Where your applications stand right now.</p></div></div>{chartData.length ? <ResponsiveContainer width="100%" height={280}><BarChart data={chartData} margin={{top:10,right:10,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="status"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="count" name="Applications" fill="#2563eb" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer> : <div className="empty-chart">Add your first application to see your pipeline.</div>}</div>
      <div className="panel tips-panel"><h2>Job search snapshot</h2><div className="snapshot"><span>Interview rate</span><strong>{summary.interviewRate || 0}%</strong></div><div className="snapshot"><span>Offer rate</span><strong>{summary.offerRate || 0}%</strong></div><div className="tip"><FaUserTie/><div><strong>Tip</strong><p>Keep notes for every recruiter conversation so you never lose the next step.</p></div></div></div>
    </section>

    <section className="panel jobs-panel"><div className="jobs-toolbar"><div><h2>Your applications</h2><p>{jobs.length} result{jobs.length === 1 ? "" : "s"}</p></div><div className="filters"><label className="search"><FaSearch/><input placeholder="Search company, role..." value={query} onChange={(e)=>setQuery(e.target.value)} /></label><select value={status} onChange={(e)=>setStatus(e.target.value)}><option value="all">All statuses</option><option value="applied">Applied</option><option value="interview">Interview</option><option value="offer">Offer</option><option value="rejected">Rejected</option></select><select value={sort} onChange={(e)=>setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div></div>
      {loading ? <LoadingSpinner label="Refreshing applications..." /> : jobs.length ? <div className="job-list">{jobs.map((job)=><article className="job-row" key={job.id}><div className="company-avatar">{job.company?.charAt(0)?.toUpperCase() || "?"}</div><div className="job-main"><h3>{job.role}</h3><p>{job.company}{job.location ? ` · ${job.location}` : ""}</p><div className="job-meta"><span className={`status ${job.status}`}>{labels[job.status] || job.status}</span><span><FaCalendarAlt/> {new Date(`${job.date_applied}T00:00:00`).toLocaleDateString()}</span>{job.recruiter && <span><FaUserTie/> {job.recruiter}</span>}</div></div><div className="job-actions">{job.job_url && <a href={job.job_url} target="_blank" rel="noreferrer" className="icon-button" title="Open job posting"><FaExternalLinkAlt/></a>}<Link to={`/edit-job/${job.id}`} className="icon-button" title="Edit"><FaEdit/></Link><button className="icon-button danger" title="Delete" onClick={()=>deleteJob(job.id)} disabled={deleting===job.id}>{deleting===job.id ? "…" : <FaTrash/>}</button></div></article>)}</div> : <div className="empty-state"><div className="empty-icon">📋</div><h3>No applications found</h3><p>{query || status !== "all" ? "Try changing your search or filters." : "Start by adding your first job application."}</p>{query || status !== "all" ? <button className="clear-button" onClick={()=>{setQuery("");setStatus("all")}}>Clear filters</button> : <Link to="/add-job" className="hero-button">Add your first job</Link>}</div>}
    </section>
  </div>;
}
