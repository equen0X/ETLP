const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { upload, uploadToCloudinary } = require("../middleware/uploadMiddleware");
const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe);
router.put("/profile", protect, upload.single("profile_image"), uploadToCloudinary, updateProfile);

module.exports = router;