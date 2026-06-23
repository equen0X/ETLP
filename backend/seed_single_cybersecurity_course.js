const db = require("./config/db");

async function seed() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      thumbnail VARCHAR(255),
      video_url VARCHAR(500),
      rating VARCHAR(20) DEFAULT '4.8',
      students VARCHAR(20) DEFAULT '1.2k',
      duration VARCHAR(20) DEFAULT '12h',
      instructor_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS modules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      video_url VARCHAR(500),
      sequence_order INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS videos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      module_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      video_url VARCHAR(500) NOT NULL,
      duration VARCHAR(50) DEFAULT '0',
      sequence_order INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      module_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query("DELETE FROM courses");

  const [result] = await db.query(
    `INSERT INTO courses
      (title, description, category, thumbnail, video_url, rating, students, duration, instructor_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
    [
      "Cybersecurity Certification Course",
      "Learn cybersecurity fundamentals, network defense, threat analysis, and secure system practices.",
      "Cybersecurity",
      null,
      null,
      "4.8",
      "1.2k",
      "12h"
    ]
  );

  console.log(`Seeded Cybersecurity Certification Course with id ${result.insertId}`);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
