const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  getDashboard,
  getAllUsers,
  updateUserRole,
  deleteUser
} = require("../controllers/dashboardController");

router.get("/", protect, getDashboard);
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.put("/users/role", protect, authorizeRoles("admin"), updateUserRole);
router.delete("/users/:id", protect, authorizeRoles("admin"), deleteUser);

module.exports = router;