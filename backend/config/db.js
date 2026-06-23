const mysql = require("mysql2");
require("dotenv").config();

// Database configuration
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "etlp";

console.log(
  `Connecting to MySQL -> Host: ${DB_HOST}, Port: ${DB_PORT}, Database: ${DB_NAME}`
);

const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000
});

module.exports = pool.promise();