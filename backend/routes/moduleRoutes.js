const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createModule,
  getModules,
  updateModule,
  deleteModule
} = require("../controllers/moduleController");

/* Faculty/Admin */

router.post(
  "/",
  protect,
  authorizeRoles("faculty", "admin"),
  createModule
);

router.put(
  "/:id",
  protect,
  authorizeRoles("faculty", "admin"),
  updateModule
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("faculty", "admin"),
  deleteModule
);

/* Students */

router.get(
  "/course/:courseId",
  getModules
);

module.exports = router;