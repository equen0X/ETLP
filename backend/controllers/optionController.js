const db = require("../config/db");

/* Add Option */
exports.addOption = async (req, res) => {
  try {

    const {
      question_id,
      option_text,
      is_correct
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO options
      (question_id, option_text, is_correct)
      VALUES (?, ?, ?)`,
      [question_id, option_text, is_correct]
    );

    res.status(201).json({
      success: true,
      message: "Option Added",
      optionId: result.insertId
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* Get Options */
exports.getOptions = async (req, res) => {
  try {

    const [options] = await db.query(
      `SELECT id, question_id, option_text
       FROM options
       WHERE question_id=?`,
      [req.params.questionId]
    );

    res.json({
      success: true,
      options
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* Delete Option */
exports.deleteOption = async (req, res) => {
  try {

    await db.query(
      "DELETE FROM options WHERE id=?",
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Option Deleted"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};