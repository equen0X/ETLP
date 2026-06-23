const db = require("../config/db");

/* Create Course */
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const instructor_id = req.user.id;
    const thumbnail = req.file ? req.file.url : null;

    const [result] = await db.query(
      `INSERT INTO courses (title, description, category, thumbnail, instructor_id)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, category, thumbnail, instructor_id]
    );

    res.status(201).json({
      success: true,
      message: "Course Created Successfully",
      courseId: result.insertId
    });

  } catch (error) {
    console.error("Create Course Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* Get All Courses */
exports.getCourses = async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT c.*, u.name as instructor_name 
      FROM courses c 
      LEFT JOIN users u ON c.instructor_id = u.id
    `;
    let params = [];

    if (category) {
      query += " WHERE c.category = ?";
      params.push(category);
    }

    const [courses] = await db.query(query, params);

    res.json({
      success: true,
      courses
    });

  } catch (error) {
    console.error("Get Courses Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* Get Single Course with Modules, Videos, and Instructor Details */
exports.getCourse = async (req, res) => {
  try {
    let courseId = req.params.id;

    // If a malformed value containing a full URL was passed (e.g. "3http://..."),
    // attempt to extract the trailing segment (the actual id or slug).
    try {
      if (String(courseId).includes('http')) {
        const parts = String(courseId).split('/');
        const last = parts.filter(Boolean).pop();
        if (last) courseId = last;
      }
    } catch (e) {
      // ignore and continue
    }

    // Resolve numeric id or slug (e.g. 'iot-workshop') to actual numeric id
    if (!/^[0-9]+$/.test(String(courseId))) {
      const slug = String(courseId).toLowerCase();
      const [found] = await db.query(
        "SELECT id FROM courses WHERE id = ? OR REPLACE(LOWER(title),' ', '-') = ? LIMIT 1",
        [courseId, slug]
      );
      if (found && found.length > 0) {
        courseId = found[0].id;
      }
    }

    // Course + Instructor
    const [courses] = await db.query(
      `SELECT c.*, u.name as instructor_name, u.email as instructor_email 
       FROM courses c 
       LEFT JOIN users u ON c.instructor_id = u.id 
       WHERE c.id = ?`,
      [courseId]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course Not Found"
      });
    }

    // Modules
    const [modules] = await db.query(
      "SELECT * FROM modules WHERE course_id = ? ORDER BY sequence_order ASC",
      [courseId]
    );

    // Videos and Quizzes for each module
    for (let i = 0; i < modules.length; i++) {
      const [videos] = await db.query(
        "SELECT * FROM videos WHERE module_id = ? ORDER BY sequence_order ASC",
        [modules[i].id]
      );
      modules[i].videos = videos;

      const [quizzes] = await db.query(
        "SELECT * FROM quizzes WHERE module_id = ?",
        [modules[i].id]
      );
      modules[i].quizzes = quizzes;
    }

    res.json({
      success: true,
      course: courses[0],
      modules
    });

  } catch (error) {
    console.error("Get Course Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* Update Course */
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const courseId = req.params.id;
    let query = "UPDATE courses SET title = ?, description = ?, category = ?";
    let params = [title, description, category];

    if (req.file) {
      query += ", thumbnail = ?";
      params.push(req.file.url);
    }

    query += " WHERE id = ?";
    params.push(courseId);

    await db.query(query, params);

    res.json({
      success: true,
      message: "Course Updated Successfully"
    });

  } catch (error) {
    console.error("Update Course Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* Delete Course */
exports.deleteCourse = async (req, res) => {
  try {
    await db.query("DELETE FROM courses WHERE id = ?", [req.params.id]);

    res.json({
      success: true,
      message: "Course Deleted Successfully"
    });

  } catch (error) {
    console.error("Delete Course Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* Get Courses by Faculty/Instructor */
exports.getInstructorCourses = async (req, res) => {
  try {
    const instructor_id = req.user.id;
    const [courses] = await db.query(
      "SELECT * FROM courses WHERE instructor_id = ?",
      [instructor_id]
    );

    res.json({
      success: true,
      courses
    });
  } catch (error) {
    console.error("Get Instructor Courses Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};