const db = require('../config/db');

async function migrate() {
  try {
    const schema = process.env.DB_NAME || 'etlp';

    async function addIfMissing(columnName, ddl) {
      const [rows] = await db.query(
        'SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        [schema, 'users', columnName]
      );
      if (rows[0].cnt === 0) {
        await db.query(`ALTER TABLE users ADD COLUMN ${ddl}`);
        console.log(`Added column ${columnName}`);
      } else {
        console.log(`Column ${columnName} already exists`);
      }
    }

    await addIfMissing('verified', "verified TINYINT(1) DEFAULT 0");
    await addIfMissing('verification_token', "verification_token VARCHAR(255) DEFAULT NULL");
    await addIfMissing('reset_token', "reset_token VARCHAR(255) DEFAULT NULL");
    await addIfMissing('reset_token_expires', "reset_token_expires DATETIME DEFAULT NULL");
    await addIfMissing('profile_image', "profile_image VARCHAR(255) DEFAULT NULL");

    console.log('✅ users table migrated (columns ensured)');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
