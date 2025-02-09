const express = require("express");
const router = express.Router();
const {
  getUsers,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} = require("../controllers/userController");
const { protect, admin, superadmin } = require("../middleware/authMiddleware");

// Protect all routes
router.use(protect);

// Admin routes
router.route("/").get(admin, getUsers);
router.route("/all").get(admin, getAllUsers);

// Routes som kräver admin eller superadmin
router.route("/:id/toggle").patch(admin, toggleUserStatus);
router.route("/").post(admin, createUser);
router.route("/:id").patch(admin, updateUser).delete(admin, deleteUser);

module.exports = router;
