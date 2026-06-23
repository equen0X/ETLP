const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getMyResults
} = require("../controllers/resultController");

router.get(
  "/my-results",
  protect,
  getMyResults
);

module.exports = router;