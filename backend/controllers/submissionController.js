const db = require("../config/db");
const { recalculateCourseProgress } = require("./progressController");

/* Submit Quiz answers and evaluate score */
exports.submitQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quiz_id, answers } = req.body; // answers: Array of { question_id, selected_option_id }

    let score = 0;

    // Validate and score each answer
    for (const answer of answers) {
      const [correctOption] = await db.query(
        "SELECT * FROM options WHERE question_id = ? AND is_correct = 1",
        [answer.question_id]
      );

      const isCorrect = correctOption.length > 0 && correctOption[0].id === answer.selected_option_id;
      if (isCorrect) {
        score++;
      }

      // Record answer
      await db.query(
        `INSERT INTO student_answers (user_id, quiz_id, question_id, selected_option_id)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE selected_option_id = ?`,
        [
          userId,
          quiz_id,
          answer.question_id,
          answer.selected_option_id,
          answer.selected_option_id
        ]
      );
    }

    const totalQuestions = answers.length;
    const passingScore = Math.ceil(totalQuestions * 0.5); // 50% passing criteria
    const passed = score >= passingScore ? 1 : 0;

    // Insert/record result
    await db.query(
      `INSERT INTO quiz_results (user_id, quiz_id, score, total_questions, passed)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, quiz_id, score, totalQuestions, passed]
    );

    // Get Course ID from Quiz ID
    const [quizDetails] = await db.query(
      `SELECT m.course_id, q.title as quiz_title FROM quizzes q 
       JOIN modules m ON q.module_id = m.id 
       WHERE q.id = ?`,
      [quiz_id]
    );

    let completion_percentage = 0;
    if (quizDetails.length > 0) {
      const courseId = quizDetails[0].course_id;
      // Recalculate progress for this course
      completion_percentage = await recalculateCourseProgress(userId, courseId);

      // Add a notification if passed
      if (passed) {
        await db.query(
          "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
          [userId, `You passed the quiz "${quizDetails[0].quiz_title}" with score: ${score}/${totalQuestions}!`]
        );
      }
    }

    res.status(201).json({
      success: true,
      score,
      totalQuestions,
      passed: !!passed,
      completion_percentage
    });

  } catch (error) {
    console.error("Submit Quiz Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};