const mysql = require("mysql2");
require("dotenv").config();

// Use environment variables when available, otherwise fall back to
// sensible local defaults. Update these values here if you prefer
// to hardcode local credentials for development.
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || ""; // empty string as common local default
const DB_NAME = process.env.DB_NAME || "etlp";

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.warn("Warning: some DB env vars are not set. Using local defaults in backend/config/db.js");
  console.warn(`Using host=${DB_HOST} user=${DB_USER} database=${DB_NAME}`);
}

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();