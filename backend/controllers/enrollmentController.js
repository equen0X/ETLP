const db = require("../config/db");

/* Enroll Student */
exports.enrollCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;
    console.log(`Enroll request: userId=${userId}, courseId=${courseId}`);

    // Resolve courseId: allow numeric IDs or slug-like strings (e.g. "ai-tools-course")
    let resolvedCourseId = null;
    if (typeof courseId === 'number' || /^[0-9]+$/.test(String(courseId))) {
      resolvedCourseId = Number(courseId);
    } else if (typeof courseId === 'string') {
      // Try to find a course by a slugified title (replace spaces with '-') or exact title match
      const slug = courseId.toLowerCase();
      const [found] = await db.query(
        "SELECT id, title FROM courses WHERE id = ? OR REPLACE(LOWER(title),' ', '-') = ? LIMIT 1",
        [courseId, slug]
      );
      if (found && found.length > 0) {
        resolvedCourseId = found[0].id;
      }
    }

    if (!resolvedCourseId) {
      return res.status(400).json({ success: false, message: 'Course not found' });
    }

    const [existing] = await db.query(
      "SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?",
      [userId, resolvedCourseId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Already Enrolled"
      });
    }

    await db.query(
      "INSERT INTO enrollments(user_id, course_id) VALUES(?, ?)",
      [userId, resolvedCourseId]
    );

    // Create progress tracking entry
    try {
      await db.query(
        "INSERT INTO progress_tracking(user_id, course_id, modules_completed, total_modules, completion_percentage) VALUES(?, ?, 0, 0, 0)",
        [userId, resolvedCourseId]
      );
    } catch (err) {
      console.warn('Progress tracking insert failed (non-fatal):', err.message || err);
      // Continue — progress table might be missing in some environments
    }

    res.status(201).json({
      success: true,
      message: "Enrollment Successful"
    });

  } catch (error) {
    console.error("Enroll Course Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

/* My Enrolled Courses */
exports.myCourses = async (req, res) => {
  try {
    const [courses] = await db.query(
      `SELECT c.id, c.title, c.description, c.category, c.thumbnail, e.progress, e.completed, e.enrolled_at
       FROM enrollments e 
       JOIN courses c ON e.course_id = c.id 
       WHERE e.user_id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      courses
    });

  } catch (error) {
    console.error("My Courses Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* Check Enrollment Status */
exports.checkEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Resolve courseId similar to enrollCourse
    let resolvedCourseId = null;
    if (/^[0-9]+$/.test(String(courseId))) resolvedCourseId = Number(courseId);
    else {
      const slug = String(courseId).toLowerCase();
      const [found] = await db.query(
        "SELECT id FROM courses WHERE id = ? OR REPLACE(LOWER(title),' ', '-') = ? LIMIT 1",
        [courseId, slug]
      );
      if (found && found.length > 0) resolvedCourseId = found[0].id;
    }

    if (!resolvedCourseId) {
      return res.json({ success: true, isEnrolled: false, enrollment: null });
    }

    const [enrollment] = await db.query(
      "SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?",
      [userId, resolvedCourseId]
    );

    res.json({
      success: true,
      isEnrolled: enrollment.length > 0,
      enrollment: enrollment[0] || null
    });

  } catch (error) {
    console.error("Check Enrollment Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};