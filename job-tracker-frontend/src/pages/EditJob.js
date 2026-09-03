import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import LoadingSpinner from "../components/LoadingSpinner";
import { JobForm } from "./AddJob";

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(({data}) => setForm(data)).catch((err) => { toast.error(err.response?.data?.error || "Application not found."); navigate("/dashboard"); }).finally(() => setLoading(false));
  }, [id, navigate]);

  const update = (e) => setForm({...form, [e.target.name]: e.target.value});
  const submit = async (e) => { e.preventDefault(); setSaving(true); try { await api.put(`/jobs/${id}`, form); toast.success("Application updated!"); navigate("/dashboard"); } catch (err) { toast.error(err.response?.data?.error || "Failed to update application."); } finally { setSaving(false); } };
  if (loading || !form) return <LoadingSpinner label="Loading application..." />;
  return <JobForm title="Edit application" subtitle="Keep your application details up to date." form={form} update={update} submit={submit} loading={saving} />;
}
