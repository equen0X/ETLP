const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  addQuestion,
  getQuestions,
  deleteQuestion
} = require("../controllers/questionController");

router.post(
  "/",
  protect,
  authorizeRoles("faculty", "admin"),
  addQuestion
);

router.get(
  "/quiz/:quizId",
  getQuestions
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("faculty", "admin"),
  deleteQuestion
);

module.exports = router;