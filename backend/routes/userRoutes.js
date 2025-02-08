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
router.route("/:id/toggle").put(admin, toggleUserStatus);

// Routes som kräver superadmin för admin-hantering
router.route("/").post(admin, createUser); // Admin kan skapa vanliga användare, superadmin kan skapa admin
router
  .route("/:id")
  .put(admin, updateUser) // Admin kan uppdatera vanliga användare, superadmin kan uppdatera admin
  .delete(admin, deleteUser); // Admin kan radera vanliga användare, superadmin kan radera admin

module.exports = router;
