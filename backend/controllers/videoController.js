const db = require("../config/db");

/* Add Video */
exports.addVideo = async (req, res) => {
  try {
    const { module_id, title, duration } = req.body;
    const video_url = req.file ? req.file.url : req.body.video_url;

    if (!video_url) {
      return res.status(400).json({
        success: false,
        message: "Video file or URL is required"
      });
    }

    const [result] = await db.query(
      `INSERT INTO videos (module_id, title, video_url, duration)
       VALUES (?, ?, ?, ?)`,
      [module_id, title, video_url, duration || 0]
    );

    res.status(201).json({
      success: true,
      message: "Video Added Successfully",
      videoId: result.insertId,
      videoUrl: video_url
    });

  } catch (error) {
    console.error("Add Video Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* Get Module Videos */
exports.getVideosByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const [videos] = await db.query(
      "SELECT * FROM videos WHERE module_id = ? ORDER BY sequence_order ASC",
      [moduleId]
    );

    res.json({
      success: true,
      videos
    });

  } catch (error) {
    console.error("Get Module Videos Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* Delete Video */
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM videos WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Video Deleted Successfully"
    });

  } catch (error) {
    console.error("Delete Video Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};