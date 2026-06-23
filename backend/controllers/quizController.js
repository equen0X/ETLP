const db = require("../config/db");

/* Create Quiz */
exports.createQuiz = async (req, res) => {
  try {
    const { module_id, title, time_limit } = req.body;

    const [result] = await db.query(
      `INSERT INTO quizzes(module_id, title, time_limit)
       VALUES(?, ?, ?)`,
      [module_id, title, time_limit || 15]
    );

    res.status(201).json({
      success: true,
      message: "Quiz Created Successfully",
      quizId: result.insertId
    });

  } catch (error) {
    console.error("Create Quiz Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* Get Quizzes By Module */
exports.getQuizzes = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const [quizzes] = await db.query(
      "SELECT * FROM quizzes WHERE module_id = ?",
      [moduleId]
    );

    res.json({
      success: true,
      quizzes
    });

  } catch (error) {
    console.error("Get Quizzes Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* Get Single Quiz details with questions and options (Safe for Students) */
exports.getQuizDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Get quiz
    const [quizzes] = await db.query(
      "SELECT * FROM quizzes WHERE id = ?",
      [id]
    );

    if (quizzes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz Not Found"
      });
    }

    const quiz = quizzes[0];

    // Get questions
    const [questions] = await db.query(
      "SELECT id, question FROM questions WHERE quiz_id = ?",
      [id]
    );

    // Get options for each question (safe without is_correct)
    for (let i = 0; i < questions.length; i++) {
      const [options] = await db.query(
        "SELECT id, option_text FROM options WHERE question_id = ?",
        [questions[i].id]
      );
      questions[i].options = options;
    }

    res.json({
      success: true,
      quiz,
      questions
    });

  } catch (error) {
    console.error("Get Quiz Details Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* Delete Quiz */
exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM quizzes WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Quiz Deleted Successfully"
    });

  } catch (error) {
    console.error("Delete Quiz Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};