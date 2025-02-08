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
const { protect, admin } = require("../middleware/authMiddleware");

// Protect all routes
router.use(protect);
router.use(admin);

// Get all users
router.route("/").get(getUsers).post(createUser);

// Get all users
router.route("/all").get(getAllUsers);

// Get single user
router.route("/:id").put(updateUser).delete(deleteUser);

// Toggle user status
router.route("/:id/toggle").put(toggleUserStatus);

module.exports = router;
