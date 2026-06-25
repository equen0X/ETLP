USE etlp;

ALTER TABLE modules MODIFY video_url VARCHAR(1000) NULL;
ALTER TABLE videos MODIFY video_url VARCHAR(1000) NOT NULL;

UPDATE courses
SET video_url = NULL
WHERE video_url LIKE '%drive.google.com%';

-- Replace these URLs with real Cloudinary URLs or files that exist under backend/uploads.
-- The frontend can play direct .mp4/.webm/.ogg URLs, Cloudinary video URLs, and /uploads/*.mp4 files.
SET @cyber_video_1 = '/uploads/cyber-session-1.mp4';
SET @cyber_video_2 = '/uploads/cyber-session-2.mp4';
SET @ai_video_1 = '/uploads/ai-tools-session-1.mp4';
SET @ai_video_2 = '/uploads/ai-tools-session-2.mp4';
SET @iot_video_1 = '/uploads/iot-session-1.mp4';
SET @iot_video_2 = '/uploads/iot-session-2.mp4';
SET @quantum_video_1 = '/uploads/quantum-session-1.mp4';
SET @quantum_video_2 = '/uploads/quantum-session-2.mp4';

-- Cybersecurity
SET @course_id = (
  SELECT id FROM courses
  WHERE REPLACE(LOWER(title), ' ', '-') = 'cybersecurity-certification-course'
  LIMIT 1
);

INSERT INTO modules (course_id, title, description, sequence_order)
SELECT @course_id, 'Network Security Basics', 'Firewall, VPN, IDS and secure network design.', 1
WHERE @course_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM modules
    WHERE course_id = @course_id AND title = 'Network Security Basics'
  );

SET @module_id = (
  SELECT id FROM modules
  WHERE course_id = @course_id AND title = 'Network Security Basics'
  LIMIT 1
);

INSERT INTO videos (module_id, title, video_url, duration, sequence_order)
SELECT @module_id, 'Session 1 - Introduction', @cyber_video_1, 600, 1
WHERE @module_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM videos
    WHERE module_id = @module_id AND title = 'Session 1 - Introduction'
  );

INSERT INTO videos (module_id, title, video_url, duration, sequence_order)
SELECT @module_id, 'Session 2 - Firewalls and VPNs', @cyber_video_2, 900, 2
WHERE @module_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM videos
    WHERE module_id = @module_id AND title = 'Session 2 - Firewalls and VPNs'
  );

-- AI Tools
SET @course_id = (
  SELECT id FROM courses
  WHERE REPLACE(LOWER(title), ' ', '-') = 'ai-tools-course'
  LIMIT 1
);

INSERT INTO modules (course_id, title, description, sequence_order)
SELECT @course_id, 'AI Tools Fundamentals', 'Popular AI tools, prompting, workflows, and responsible use.', 1
WHERE @course_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM modules
    WHERE course_id = @course_id AND title = 'AI Tools Fundamentals'
  );

SET @module_id = (
  SELECT id FROM modules
  WHERE course_id = @course_id AND title = 'AI Tools Fundamentals'
  LIMIT 1
);

INSERT INTO videos (module_id, title, video_url, duration, sequence_order)
SELECT @module_id, 'Session 1 - AI Tools Overview', @ai_video_1, 720, 1
WHERE @module_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM videos
    WHERE module_id = @module_id AND title = 'Session 1 - AI Tools Overview'
  );

INSERT INTO videos (module_id, title, video_url, duration, sequence_order)
SELECT @module_id, 'Session 2 - Prompting Workflow', @ai_video_2, 840, 2
WHERE @module_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM videos
    WHERE module_id = @module_id AND title = 'Session 2 - Prompting Workflow'
  );

-- IoT
SET @course_id = (
  SELECT id FROM courses
  WHERE REPLACE(LOWER(title), ' ', '-') IN ('iot-workshop', 'internet-of-things-(iot)-workshop')
  LIMIT 1
);

INSERT INTO modules (course_id, title, description, sequence_order)
SELECT @course_id, 'IoT Workshop Sessions', 'Sensors, microcontrollers, connectivity, and practical IoT implementation.', 1
WHERE @course_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM modules
    WHERE course_id = @course_id AND title = 'IoT Workshop Sessions'
  );

SET @module_id = (
  SELECT id FROM modules
  WHERE course_id = @course_id AND title = 'IoT Workshop Sessions'
  LIMIT 1
);

INSERT INTO videos (module_id, title, video_url, duration, sequence_order)
SELECT @module_id, 'Session 1 - IoT Introduction', @iot_video_1, 780, 1
WHERE @module_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM videos
    WHERE module_id = @module_id AND title = 'Session 1 - IoT Introduction'
  );

INSERT INTO videos (module_id, title, video_url, duration, sequence_order)
SELECT @module_id, 'Session 2 - Sensors and Devices', @iot_video_2, 900, 2
WHERE @module_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM videos
    WHERE module_id = @module_id AND title = 'Session 2 - Sensors and Devices'
  );

-- Quantum Computing
SET @course_id = (
  SELECT id FROM courses
  WHERE REPLACE(LOWER(title), ' ', '-') = 'quantum-computing-certification-course'
  LIMIT 1
);

INSERT INTO modules (course_id, title, description, sequence_order)
SELECT @course_id, 'Quantum Computing Foundations', 'Qubits, gates, measurement, circuits, and introductory quantum algorithms.', 1
WHERE @course_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM modules
    WHERE course_id = @course_id AND title = 'Quantum Computing Foundations'
  );

SET @module_id = (
  SELECT id FROM modules
  WHERE course_id = @course_id AND title = 'Quantum Computing Foundations'
  LIMIT 1
);

INSERT INTO videos (module_id, title, video_url, duration, sequence_order)
SELECT @module_id, 'Session 1 - Qubits and Superposition', @quantum_video_1, 840, 1
WHERE @module_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM videos
    WHERE module_id = @module_id AND title = 'Session 1 - Qubits and Superposition'
  );

INSERT INTO videos (module_id, title, video_url, duration, sequence_order)
SELECT @module_id, 'Session 2 - Quantum Gates', @quantum_video_2, 960, 2
WHERE @module_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM videos
    WHERE module_id = @module_id AND title = 'Session 2 - Quantum Gates'
  );

SELECT
  c.title AS course,
  m.sequence_order AS module_order,
  m.title AS module,
  v.sequence_order AS session_order,
  v.title AS session,
  v.video_url
FROM courses c
JOIN modules m ON m.course_id = c.id
LEFT JOIN videos v ON v.module_id = m.id
ORDER BY c.id, m.sequence_order, v.sequence_order;
