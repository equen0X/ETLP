const express = require("express");

const router = express.Router();

const protect =
require("../middleware/authMiddleware");

const {
    addRating,
    getRatings
} = require("../controllers/ratingController");

router.post(
    "/",
    protect,
    addRating
);

router.get(
    "/:courseId",
    getRatings
);

module.exports = router;