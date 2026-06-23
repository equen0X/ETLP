const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  addOption,
  getOptions,
  deleteOption
} = require("../controllers/optionController");

router.post(
  "/",
  protect,
  authorizeRoles("faculty", "admin"),
  addOption
);

router.get(
  "/question/:questionId",
  getOptions
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("faculty", "admin"),
  deleteOption
);

module.exports = router;