# The Job Log — Full-Stack Job Application Tracker

A production-oriented PERN application for tracking job applications from **Applied → Interview → Offer/Rejected**.

## Stack

- React 19 + React Router
- Express 5 + Node.js
- PostgreSQL
- JWT authentication
- Axios
- Recharts
- Vercel (frontend)
- Render (backend)

## Features

- Account registration and login
- Protected routes and JWT authentication
- Add, edit and delete applications
- Search by company, role or recruiter
- Filter by application status
- Sort newest/oldest
- Application date, location, salary, recruiter, URL and notes
- Dashboard statistics and pipeline chart
- Responsive mobile-friendly UI
- PostgreSQL indexes and parameterized queries
- CORS configuration for production
- Health endpoint for deployment monitoring
- GitHub Actions CI

## Project structure

```text
The-Job-Log/
├── job-tracker-backend/
│   ├── middleware/
│   ├── routes/
│   ├── db.js
│   ├── db.sql
│   ├── migration-v2.sql
│   ├── server.js
│   └── .env.example
├── job-tracker-frontend/
│   ├── public/
│   ├── src/
│   ├── vercel.json
│   └── .env.example
├── .github/workflows/ci.yml
├── render.yaml
└── DEPLOYMENT.md
```

## Local development

### 1. Backend

```bash
cd job-tracker-backend
cp .env.example .env
npm install
npm run dev
```

Create a PostgreSQL database and run `db.sql` in it.

### 2. Frontend

```bash
cd job-tracker-frontend
cp .env.example .env
npm install
npm start
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:5000`

Health check: `http://localhost:5000/health`

## Important security note

Never commit `.env` files, database passwords or JWT secrets. If credentials were previously committed to a public GitHub repository, rotate them before deployment and clean the Git history if necessary.
