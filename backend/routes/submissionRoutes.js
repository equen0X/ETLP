const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  submitQuiz
} = require("../controllers/submissionController");

router.post(
  "/",
  protect,
  submitQuiz
);

module.exports = router;