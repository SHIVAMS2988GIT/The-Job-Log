const { Pool } = require("pg");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  ...(connectionString
    ? { connectionString }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT || 5432),
      }),
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ...(process.env.NODE_ENV === "production" && connectionString
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

module.exports = pool;
