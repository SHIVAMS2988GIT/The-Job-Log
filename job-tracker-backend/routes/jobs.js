const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

const STATUSES = ["applied", "interview", "offer", "rejected"];

function parseJobPayload(body) {
  return {
    company: String(body.company || "").trim(),
    role: String(body.role || "").trim(),
    status: String(body.status || "applied").trim().toLowerCase(),
    dateApplied: body.date_applied || body.dateApplied || null,
    location: String(body.location || "").trim(),
    jobUrl: String(body.job_url || body.jobUrl || "").trim(),
    salary: String(body.salary || "").trim(),
    recruiter: String(body.recruiter || "").trim(),
    notes: String(body.notes || "").trim(),
  };
}

function validateJob(job) {
  if (!job.company || job.company.length > 150) return "Company is required and must be 150 characters or fewer.";
  if (!job.role || job.role.length > 150) return "Role is required and must be 150 characters or fewer.";
  if (!STATUSES.includes(job.status)) return `Status must be one of: ${STATUSES.join(", ")}.`;
  if (job.location.length > 150) return "Location must be 150 characters or fewer.";
  if (job.salary.length > 100) return "Salary must be 100 characters or fewer.";
  if (job.recruiter.length > 150) return "Recruiter must be 150 characters or fewer.";
  if (job.notes.length > 5000) return "Notes must be 5000 characters or fewer.";
  if (job.jobUrl && !/^https?:\/\//i.test(job.jobUrl)) return "Job URL must start with http:// or https://.";
  if (job.dateApplied && !/^\d{4}-\d{2}-\d{2}$/.test(job.dateApplied)) return "Date applied must be YYYY-MM-DD.";
  return null;
}

router.use(authenticateToken);

router.get("/", async (req, res, next) => {
  try {
    const { q = "", status = "all", sort = "newest" } = req.query;
    const values = [req.user.userId];
    const conditions = ["user_id = $1"];

    if (q.trim()) {
      values.push(`%${q.trim()}%`);
      conditions.push(`(company ILIKE $${values.length} OR role ILIKE $${values.length} OR recruiter ILIKE $${values.length})`);
    }

    if (status !== "all") {
      if (!STATUSES.includes(status)) return res.status(400).json({ error: "Invalid status filter." });
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    const orderBy = sort === "oldest" ? "date_applied ASC NULLS LAST, id ASC" : "date_applied DESC NULLS LAST, id DESC";
    const result = await pool.query(
      `SELECT id, company, role, status, date_applied, location, job_url, salary, recruiter, notes, created_at, updated_at
       FROM jobs WHERE ${conditions.join(" AND ")} ORDER BY ${orderBy}`,
      values
    );

    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
});

router.get("/dashboard", async (req, res, next) => {
  try {
    const summary = await pool.query(
      `SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'applied')::int AS applied,
        COUNT(*) FILTER (WHERE status = 'interview')::int AS interviews,
        COUNT(*) FILTER (WHERE status = 'offer')::int AS offers,
        COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected,
        COUNT(*) FILTER (WHERE date_applied >= CURRENT_DATE - INTERVAL '30 days')::int AS last_30_days
       FROM jobs WHERE user_id = $1`,
      [req.user.userId]
    );

    const chart = await pool.query(
      `SELECT status, COUNT(*)::int AS count
       FROM jobs WHERE user_id = $1
       GROUP BY status
       ORDER BY CASE status
         WHEN 'applied' THEN 1 WHEN 'interview' THEN 2 WHEN 'offer' THEN 3 WHEN 'rejected' THEN 4 ELSE 5 END`,
      [req.user.userId]
    );

    const recent = await pool.query(
      `SELECT id, company, role, status, date_applied, location
       FROM jobs WHERE user_id = $1
       ORDER BY date_applied DESC NULLS LAST, id DESC LIMIT 5`,
      [req.user.userId]
    );

    const stats = summary.rows[0];
    const total = stats.total;
    const interviews = stats.interviews;
    const offers = stats.offers;

    return res.json({
      summary: {
        total,
        applied: stats.applied,
        interviews,
        offers,
        rejected: stats.rejected,
        last30Days: stats.last_30_days,
        interviewRate: total ? Number(((interviews / total) * 100).toFixed(1)) : 0,
        offerRate: total ? Number(((offers / total) * 100).toFixed(1)) : 0,
      },
      chartData: chart.rows,
      recentJobs: recent.rows,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, company, role, status, date_applied, location, job_url, salary, recruiter, notes, created_at, updated_at
       FROM jobs WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Job not found." });
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const job = parseJobPayload(req.body);
    const validationError = validateJob(job);
    if (validationError) return res.status(400).json({ error: validationError });

    const result = await pool.query(
      `INSERT INTO jobs (user_id, company, role, status, date_applied, location, job_url, salary, recruiter, notes)
       VALUES ($1,$2,$3,$4,COALESCE($5::date,CURRENT_DATE),$6,$7,$8,$9,$10)
       RETURNING id, company, role, status, date_applied, location, job_url, salary, recruiter, notes, created_at, updated_at`,
      [req.user.userId, job.company, job.role, job.status, job.dateApplied, job.location, job.jobUrl || null, job.salary, job.recruiter, job.notes]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const job = parseJobPayload(req.body);
    const validationError = validateJob(job);
    if (validationError) return res.status(400).json({ error: validationError });

    const result = await pool.query(
      `UPDATE jobs SET company=$1, role=$2, status=$3, date_applied=COALESCE($4::date,date_applied),
       location=$5, job_url=$6, salary=$7, recruiter=$8, notes=$9, updated_at=CURRENT_TIMESTAMP
       WHERE id=$10 AND user_id=$11
       RETURNING id, company, role, status, date_applied, location, job_url, salary, recruiter, notes, created_at, updated_at`,
      [job.company, job.role, job.status, job.dateApplied, job.location, job.jobUrl || null, job.salary, job.recruiter, job.notes, req.params.id, req.user.userId]
    );

    if (!result.rows[0]) return res.status(404).json({ error: "Job not found." });
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM jobs WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Job not found." });
    return res.json({ message: "Job deleted successfully." });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
