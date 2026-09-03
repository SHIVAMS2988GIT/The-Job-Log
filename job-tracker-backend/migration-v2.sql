-- Migration for an existing The Job Log database.
-- BACK UP your production database before running this file.

UPDATE users SET name = COALESCE(NULLIF(TRIM(name), ''), 'User');
ALTER TABLE users ALTER COLUMN name SET NOT NULL;
ALTER TABLE users ALTER COLUMN name SET DEFAULT '';
ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(255);

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location VARCHAR(150) NOT NULL DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_url TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS recruiter VARCHAR(150) NOT NULL DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE users SET email = LOWER(TRIM(email));
UPDATE jobs SET status = LOWER(TRIM(status));
UPDATE jobs SET status = 'applied' WHERE status IS NULL OR status NOT IN ('applied','interview','offer','rejected');
UPDATE jobs SET company = COALESCE(NULLIF(TRIM(company), ''), 'Unknown company'), role = COALESCE(NULLIF(TRIM(role), ''), 'Unknown role');

ALTER TABLE jobs ALTER COLUMN company SET NOT NULL;
ALTER TABLE jobs ALTER COLUMN role SET NOT NULL;
ALTER TABLE jobs ALTER COLUMN status SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_status ON jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_user_date ON jobs(user_id, date_applied DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_status_check') THEN
    ALTER TABLE jobs ADD CONSTRAINT jobs_status_check CHECK (status IN ('applied','interview','offer','rejected'));
  END IF;
END $$;
