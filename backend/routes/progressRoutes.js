const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  updateProgress,
  getMyProgress,
  saveVideoProgress,
  getVideoProgress,
  getSingleCourseProgress
} = require("../controllers/progressController");

router.post("/update", protect, updateProgress);
router.get("/my-progress", protect, getMyProgress);
router.post("/video", protect, saveVideoProgress);
router.get("/video/:videoId", protect, getVideoProgress);
router.get("/course/:courseId", protect, getSingleCourseProgress);

module.exports = router;