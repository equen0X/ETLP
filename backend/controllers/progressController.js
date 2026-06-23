const db = require("../config/db");

// Helper function to recalculate course progress based on the formula:
// Progress = ((videos_watched / total_videos) * 0.6 + (sum_quiz_score / sum_quiz_max) * 0.4) * 100
const recalculateCourseProgress = async (userId, courseId) => {
  try {
    // 1. Get all videos in the course
    const [videos] = await db.query(
      `SELECT v.id FROM videos v 
       JOIN modules m ON v.module_id = m.id 
       WHERE m.course_id = ?`,
      [courseId]
    );
    const totalVideos = videos.length;

    // 2. Get watched videos count in this course
    const [[{ watchedVideos }]] = await db.query(
      `SELECT COUNT(*) as watchedVideos FROM video_progress 
       WHERE user_id = ? AND course_id = ? AND is_watched = 1`,
      [userId, courseId]
    );

    // 3. Get all quizzes in the course
    const [quizzes] = await db.query(
      `SELECT q.id FROM quizzes q 
       JOIN modules m ON q.module_id = m.id 
       WHERE m.course_id = ?`,
      [courseId]
    );
    const totalQuizzes = quizzes.length;

    // 4. Get student's highest score for each quiz in the course
    let totalScore = 0;
    let maxPossibleScore = 0;

    if (totalQuizzes > 0) {
      const quizIds = quizzes.map(q => q.id);
      const [results] = await db.query(
        `SELECT quiz_id, MAX(score) as max_score, total_questions 
         FROM quiz_results 
         WHERE user_id = ? AND quiz_id IN (${quizIds.join(",")})
         GROUP BY quiz_id, total_questions`,
        [userId]
      );

      // We sum up scores
      results.forEach(res => {
        totalScore += res.max_score || 0;
        maxPossibleScore += res.total_questions || 0;
      });

      // For quizzes not attempted yet, we add their question count (or default to 5 if not set, let's look up quiz questions)
      // To keep it simple, if no questions are found or not attempted, we just add the maximum score of attempted ones.
      // Better yet, let's fetch the actual question count for all quizzes in the course:
      const [questions] = await db.query(
        `SELECT quiz_id, COUNT(*) as q_count FROM questions 
         WHERE quiz_id IN (${quizIds.join(",")}) 
         GROUP BY quiz_id`
      );
      
      const quizQuestionCounts = {};
      questions.forEach(q => {
        quizQuestionCounts[q.quiz_id] = q.q_count;
      });

      quizzes.forEach(q => {
        const qCount = quizQuestionCounts[q.id] || 0;
        // if user attempted it, we already counted their maxPossibleScore based on total_questions.
        // if user hasn't attempted it, we add the quiz question count to the max possible base
        const attempted = results.find(r => r.quiz_id === q.id);
        if (!attempted) {
          maxPossibleScore += qCount;
        }
      });
    }

    // 5. Calculate progress percentage using the formula
    let progressPercentage = 0;

    if (totalVideos > 0 && totalQuizzes > 0) {
      const videoWeight = (watchedVideos / totalVideos) * 60;
      const quizWeight = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 40 : 0;
      progressPercentage = videoWeight + quizWeight;
    } else if (totalVideos > 0) {
      // 100% based on videos
      progressPercentage = (watchedVideos / totalVideos) * 100;
    } else if (totalQuizzes > 0) {
      // 100% based on quizzes
      progressPercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    }

    progressPercentage = Math.min(100, Math.round(progressPercentage * 100) / 100); // round to 2 decimal places

    // 6. Update progress_tracking
    const modulesCompleted = watchedVideos + (totalQuizzes > 0 ? 1 : 0); // simplifed completed items
    const totalModules = totalVideos + totalQuizzes;

    const [existing] = await db.query(
      "SELECT * FROM progress_tracking WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE progress_tracking 
         SET modules_completed = ?, total_modules = ?, completion_percentage = ?
         WHERE user_id = ? AND course_id = ?`,
        [modulesCompleted, totalModules, progressPercentage, userId, courseId]
      );
    } else {
      await db.query(
        `INSERT INTO progress_tracking (user_id, course_id, modules_completed, total_modules, completion_percentage)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, courseId, modulesCompleted, totalModules, progressPercentage]
      );
    }

    // 7. Update enrollment completion progress
    const isCompleted = progressPercentage >= 100 ? 1 : 0;
    await db.query(
      "UPDATE enrollments SET progress = ?, completed = ? WHERE user_id = ? AND course_id = ?",
      [Math.round(progressPercentage), isCompleted, userId, courseId]
    );

    // 8. Generate certificate automatically if completed
    if (isCompleted) {
      const [existingCert] = await db.query(
        "SELECT * FROM certificates WHERE user_id = ? AND course_id = ?",
        [userId, courseId]
      );
      if (existingCert.length === 0) {
        const certificateCode = `CERT-${Date.now()}-${userId}-${courseId}`;
        await db.query(
          "INSERT INTO certificates (user_id, course_id, certificate_code) VALUES (?, ?, ?)",
          [userId, courseId, certificateCode]
        );

        // Add completing notification
        await db.query(
          "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
          [userId, `Congratulations! You have completed the course and earned a certificate. Code: ${certificateCode}`]
        );
      }
    }

    return progressPercentage;
  } catch (error) {
    console.error("Error recalculating progress:", error);
    return 0;
  }
};

// 1. Update progress manually (unused, kept for compatibility)
exports.updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { course_id } = req.body;
    const progress = await recalculateCourseProgress(userId, course_id);
    res.json({ success: true, completion_percentage: progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 2. Get Student's Enrolled Progress List
exports.getMyProgress = async (req, res) => {
  try {
    const [progress] = await db.query(
      `SELECT p.*, c.title, c.category, c.thumbnail 
       FROM progress_tracking p
       JOIN courses c ON p.course_id = c.id
       WHERE p.user_id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 3. Save Video Playback Heartbeat progress
exports.saveVideoProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { video_id, course_id, current_time, is_watched } = req.body;

    const [existing] = await db.query(
      "SELECT * FROM video_progress WHERE user_id = ? AND video_id = ?",
      [userId, video_id]
    );

    if (existing.length > 0) {
      const newWatched = existing[0].is_watched === 1 ? 1 : (is_watched ? 1 : 0);
      await db.query(
        "UPDATE video_progress SET current_time = ?, is_watched = ? WHERE user_id = ? AND video_id = ?",
        [current_time, newWatched, userId, video_id]
      );
    } else {
      await db.query(
        "INSERT INTO video_progress (user_id, video_id, course_id, current_time, is_watched) VALUES (?, ?, ?, ?, ?)",
        [userId, video_id, course_id, current_time, is_watched ? 1 : 0]
      );
    }

    // Recalculate progress for this course
    const completion_percentage = await recalculateCourseProgress(userId, course_id);

    res.json({
      success: true,
      message: "Video Progress Saved",
      completion_percentage
    });
  } catch (error) {
    console.error("Save Video Progress Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 4. Get Video Playback progress (to resume video)
exports.getVideoProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { videoId } = req.params;

    const [progress] = await db.query(
      "SELECT * FROM video_progress WHERE user_id = ? AND video_id = ?",
      [userId, videoId]
    );

    res.json({
      success: true,
      progress: progress[0] || { current_time: 0, is_watched: 0 }
    });
  } catch (error) {
    console.error("Get Video Progress Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 5. Get detailed single course progress (for Course Details page layout)
exports.getSingleCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const [progress] = await db.query(
      "SELECT * FROM progress_tracking WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );

    const [watchedVideos] = await db.query(
      "SELECT video_id, current_time, is_watched FROM video_progress WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );

    res.json({
      success: true,
      progress: progress[0] || { completion_percentage: 0 },
      watchedVideos
    });
  } catch (error) {
    console.error("Get Course Progress Detail Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.recalculateCourseProgress = recalculateCourseProgress;