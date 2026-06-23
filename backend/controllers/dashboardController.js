const db = require("../config/db");

exports.getDashboard = async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    if (role === "admin") {
      // Admin Dashboard Stats
      const [[{ totalStudents }]] = await db.query(
        "SELECT COUNT(*) as totalStudents FROM users WHERE role = 'student'"
      );
      const [[{ totalFaculty }]] = await db.query(
        "SELECT COUNT(*) as totalFaculty FROM users WHERE role = 'faculty'"
      );
      const [[{ totalCourses }]] = await db.query(
        "SELECT COUNT(*) as totalCourses FROM courses"
      );
      const [[{ totalEnrollments }]] = await db.query(
        "SELECT COUNT(*) as totalEnrollments FROM enrollments"
      );
      const [categoryStats] = await db.query(
        "SELECT category, COUNT(*) as count FROM courses GROUP BY category"
      );
      const [recentUsers] = await db.query(
        "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5"
      );

      return res.json({
        success: true,
        role,
        stats: {
          totalStudents,
          totalFaculty,
          totalCourses,
          totalEnrollments,
          categoryStats,
          recentUsers
        }
      });
    }

    if (role === "faculty") {
      // Faculty Dashboard Stats
      const [[{ myCoursesCount }]] = await db.query(
        "SELECT COUNT(*) as myCoursesCount FROM courses WHERE instructor_id = ?",
        [userId]
      );

      // Get count of students enrolled in this instructor's courses
      const [[{ totalStudentsEnrolled }]] = await db.query(
        `SELECT COUNT(DISTINCT e.user_id) as totalStudentsEnrolled 
         FROM enrollments e 
         JOIN courses c ON e.course_id = c.id 
         WHERE c.instructor_id = ?`,
        [userId]
      );

      // Get list of courses with enrollment count
      const [courseStats] = await db.query(
        `SELECT c.id, c.title, c.category, COUNT(e.id) as enrollmentCount 
         FROM courses c 
         LEFT JOIN enrollments e ON c.id = e.course_id 
         WHERE c.instructor_id = ? 
         GROUP BY c.id`,
        [userId]
      );

      // Get student quiz performance under this instructor
      const [quizAttempts] = await db.query(
        `SELECT qr.id, u.name as student_name, c.title as course_title, q.title as quiz_title, qr.score, qr.total_questions, qr.created_at
         FROM quiz_results qr
         JOIN users u ON qr.user_id = u.id
         JOIN quizzes q ON qr.quiz_id = q.id
         JOIN modules m ON q.module_id = m.id
         JOIN courses c ON m.course_id = c.id
         WHERE c.instructor_id = ?
         ORDER BY qr.created_at DESC LIMIT 10`,
        [userId]
      );

      return res.json({
        success: true,
        role,
        stats: {
          myCoursesCount,
          totalStudentsEnrolled,
          courseStats,
          quizAttempts
        }
      });
    }

    if (role === "student") {
      // Student Dashboard Stats
      const [[{ enrolledCount }]] = await db.query(
        "SELECT COUNT(*) as enrolledCount FROM enrollments WHERE user_id = ?",
        [userId]
      );
      const [[{ completedCount }]] = await db.query(
        "SELECT COUNT(*) as completedCount FROM enrollments WHERE user_id = ? AND completed = 1",
        [userId]
      );
      const [[{ avgScore }]] = await db.query(
        "SELECT AVG(score/total_questions * 100) as avgScore FROM quiz_results WHERE user_id = ?",
        [userId]
      );
      const [recentProgress] = await db.query(
        `SELECT p.*, c.title, c.category, c.thumbnail 
         FROM progress_tracking p 
         JOIN courses c ON p.course_id = c.id 
         WHERE p.user_id = ? 
         ORDER BY p.updated_at DESC LIMIT 5`,
        [userId]
      );
      const [certificatesCount] = await db.query(
        "SELECT COUNT(*) as count FROM certificates WHERE user_id = ?",
        [userId]
      );

      return res.json({
        success: true,
        role,
        stats: {
          enrolledCount,
          completedCount,
          avgScore: avgScore ? Math.round(avgScore) : 0,
          recentProgress,
          certificatesCount: certificatesCount[0]?.count || 0
        }
      });
    }

    res.status(400).json({ success: false, message: "Invalid Role" });
  } catch (error) {
    console.error("Dashboard Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Admin list of users management
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, role, verified, created_at FROM users WHERE role != 'admin' ORDER BY created_at DESC"
    );
    res.json({ success: true, users });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Admin action to change role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    await db.query("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
    res.json({ success: true, message: `User role updated to ${role}` });
  } catch (error) {
    console.error("Update User Role Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Admin action to delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};