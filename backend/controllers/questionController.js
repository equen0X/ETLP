const db = require("../config/db");

/* Add Question */
exports.addQuestion = async (req, res) => {
  try {

    const { quiz_id, question } = req.body;

    const [result] = await db.query(
      `INSERT INTO questions
      (quiz_id, question)
      VALUES (?, ?)`,
      [quiz_id, question]
    );

    res.status(201).json({
      success: true,
      message: "Question Added",
      questionId: result.insertId
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* Get Questions By Quiz */
exports.getQuestions = async (req, res) => {
  try {

    const [questions] = await db.query(
      `SELECT * FROM questions
       WHERE quiz_id=?`,
      [req.params.quizId]
    );

    res.json({
      success: true,
      questions
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* Delete Question */
exports.deleteQuestion = async (req, res) => {
  try {

    await db.query(
      "DELETE FROM questions WHERE id=?",
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Question Deleted"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};