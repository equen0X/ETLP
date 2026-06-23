const db = require('./config/db');

async function check() {
  try {
    const [rows] = await db.query("SHOW TABLES LIKE 'users'");
    console.log('Result:', rows);
    process.exit(0);
  } catch (err) {
    console.error('Error querying DB:', err);
    process.exit(1);
  }
}

check();
