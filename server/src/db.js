import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

// Test connection on startup
pool.connect()
  .then(() => console.log("✅ Connected to Neon PostgreSQL database"))
  .catch(err => console.error("❌ Database connection failed:", err.message));

export async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}
