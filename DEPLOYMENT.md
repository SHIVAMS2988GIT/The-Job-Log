# The Job Log — GitHub + Deployment Guide

This guide assumes the repository is named `The-Job-Log` and the default branch is `main`.

## Part 1 — Before pushing to GitHub

1. Create NEW database credentials if old credentials were ever committed to GitHub.
2. Create a strong JWT secret (at least 32 random characters).
3. Do not copy your real `.env` files into this project.
4. Make sure `node_modules` and `.env` are ignored by Git.

If this is a fresh GitHub repository, the commands below are enough.

## Part 2 — Push the improved project

Open PowerShell/Terminal in the root of the extracted project:

```bash
git init
git branch -M main
git add .
git status
git commit -m "feat: production-ready job tracker"
git remote add origin https://github.com/YOUR_USERNAME/The-Job-Log.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

If Git says `remote origin already exists`, use:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/The-Job-Log.git
git push -u origin main
```

### If the old repository already contains secrets

Do NOT assume deleting `.env` in the new commit is enough. Rotate the leaked password/JWT secret first. Then clean the Git history if needed. A safe approach is to create a fresh cleaned repository and push the improved project there, or use GitHub's documented sensitive-data removal procedure.

## Part 3 — Create PostgreSQL

Create a PostgreSQL database using your chosen provider (Render PostgreSQL or Neon are both suitable).

For a new database, run:

```text
job-tracker-backend/db.sql
```

If you already have the old Job Log database and want to keep its data, back it up and run:

```text
job-tracker-backend/migration-v2.sql
```

## Part 4 — Deploy backend on Render

Create a new **Web Service** connected to your GitHub repository.

Settings:

```text
Root Directory: job-tracker-backend
Runtime: Node
Build Command: npm ci
Start Command: npm start
Health Check Path: /health
```

Environment variables:

```text
NODE_ENV=production
DATABASE_URL=your-postgresql-connection-string
JWT_SECRET=your-new-long-random-secret
CLIENT_URL=https://your-frontend.vercel.app
```

After deployment, open:

```text
https://YOUR-API.onrender.com/health
```

You should receive JSON similar to:

```json
{"status":"ok","database":"connected"}
```

## Part 5 — Deploy frontend on Vercel

Import the same GitHub repository into Vercel.

Set the project root to:

```text
job-tracker-frontend
```

Build command:

```text
npm run build
```

Output directory:

```text
build
```

Add this environment variable:

```text
REACT_APP_API_URL=https://YOUR-API.onrender.com
```

Deploy.

## Part 6 — Update CORS

After Vercel gives you the real production URL, go back to Render and set:

```text
CLIENT_URL=https://YOUR-REAL-VERCEL-DOMAIN.vercel.app
```

Redeploy/restart the backend.

## Part 7 — Test production

Test in this order:

1. Open frontend.
2. Register a new account.
3. Login.
4. Add a job.
5. Refresh the page.
6. Search/filter jobs.
7. Edit a job.
8. Delete a job.
9. Open a saved job URL.
10. Open backend `/health` and confirm database is connected.

## Common deployment errors

### CORS error

Make sure `CLIENT_URL` exactly matches the Vercel origin, including `https://` and without a trailing slash.

### 404 when refreshing a React route

`job-tracker-frontend/vercel.json` contains the SPA rewrite needed for Vercel.

### Database connection failure

Check `DATABASE_URL`, PostgreSQL network access, and whether the database schema has been created/migrated.

### JWT errors

Check that `JWT_SECRET` exists on Render and is the same value for the running backend instance.

### API calls still point to localhost

Production frontend must have:

```text
REACT_APP_API_URL=https://YOUR-API.onrender.com
```

After changing a Vercel environment variable, redeploy the frontend because CRA embeds `REACT_APP_*` variables during the build.
