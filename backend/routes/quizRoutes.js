const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createQuiz,
  getQuizzes,
  getQuizDetails,
  deleteQuiz
} = require("../controllers/quizController");

router.post(
  "/",
  protect,
  authorizeRoles("faculty", "admin"),
  createQuiz
);

router.get(
  "/module/:moduleId",
  protect,
  getQuizzes
);

router.get(
  "/:id",
  protect,
  getQuizDetails
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("faculty", "admin"),
  deleteQuiz
);

module.exports = router;