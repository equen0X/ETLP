const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { upload, uploadToCloudinary } = require("../middleware/uploadMiddleware");

const {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses
} = require("../controllers/courseController");

/* Instructor Courses list */
router.get(
  "/instructor/me",
  protect,
  authorizeRoles("faculty", "admin"),
  getInstructorCourses
);

/* Faculty/Admin actions */
router.post(
  "/",
  protect,
  authorizeRoles("faculty", "admin"),
  upload.single("thumbnail"),
  uploadToCloudinary,
  createCourse
);

router.put(
  "/:id",
  protect,
  authorizeRoles("faculty", "admin"),
  upload.single("thumbnail"),
  uploadToCloudinary,
  updateCourse
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("faculty", "admin"),
  deleteCourse
);

/* Public */
router.get("/", getCourses);
router.get("/:id", getCourse);

module.exports = router;