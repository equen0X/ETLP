const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { upload, uploadToCloudinary } = require("../middleware/uploadMiddleware");

const {
  addVideo,
  getVideosByModule,
  deleteVideo
} = require("../controllers/videoController");

router.post(
  "/",
  protect,
  authorizeRoles("faculty", "admin"),
  upload.single("video"),
  uploadToCloudinary,
  addVideo
);

router.get(
  "/module/:moduleId",
  protect,
  getVideosByModule
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("faculty", "admin"),
  deleteVideo
);

module.exports = router;