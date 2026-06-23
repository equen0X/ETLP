const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  chatbotResponse,
  generateSummary,
  getRecommendations
} = require("../controllers/aiController");

router.post("/chatbot", protect, chatbotResponse);
router.post("/summary", protect, generateSummary);
router.get("/recommend", protect, getRecommendations);

module.exports = router;
