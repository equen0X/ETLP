const db = require('./config/db');

async function show() {
  try {
    const [rows] = await db.query("SHOW CREATE TABLE users");
    console.log(rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('Error querying DB:', err);
    process.exit(1);
  }
}

show();
