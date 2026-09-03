-- Fresh database schema for The Job Log v2.
-- Run this on a NEW/EMPTY database.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company VARCHAR(150) NOT NULL,
    role VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'applied' CHECK (status IN ('applied','interview','offer','rejected')),
    date_applied DATE NOT NULL DEFAULT CURRENT_DATE,
    location VARCHAR(150) NOT NULL DEFAULT '',
    job_url TEXT,
    salary VARCHAR(100) NOT NULL DEFAULT '',
    recruiter VARCHAR(150) NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_status ON jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_user_date ON jobs(user_id, date_applied DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
