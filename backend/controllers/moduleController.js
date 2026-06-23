const db = require("../config/db");

/* Create Module */
exports.createModule = async (req, res) => {
  try {
    const { course_id, title, description, video_url } = req.body;

    const [result] = await db.query(
      `INSERT INTO modules
      (course_id,title,description,video_url)
      VALUES(?,?,?,?)`,
      [course_id, title, description, video_url]
    );

    res.status(201).json({
      success: true,
      message: "Module Created",
      moduleId: result.insertId
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* Get Modules By Course */
exports.getModules = async (req, res) => {
  try {

    const [modules] = await db.query(
      `SELECT * FROM modules
       WHERE course_id=?`,
      [req.params.courseId]
    );

    res.json({
      success: true,
      modules
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* Update Module */
exports.updateModule = async (req, res) => {
  try {

    const { title, description, video_url } = req.body;

    await db.query(
      `UPDATE modules
      SET title=?,description=?,video_url=?
      WHERE id=?`,
      [title, description, video_url, req.params.id]
    );

    res.json({
      success: true,
      message: "Module Updated"
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* Delete Module */
exports.deleteModule = async (req, res) => {
  try {

    await db.query(
      "DELETE FROM modules WHERE id=?",
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Module Deleted"
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};