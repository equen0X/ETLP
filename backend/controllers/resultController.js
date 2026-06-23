const db = require("../config/db");

/* My Results */

exports.getMyResults = async (req, res) => {
  try {

    const [results] = await db.query(
      `
      SELECT
      qr.*,
      q.title
      FROM quiz_results qr
      JOIN quizzes q
      ON qr.quiz_id = q.id
      WHERE qr.user_id = ?
      `,
      [req.user.id]
    );

    res.json({
      success: true,
      results
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};