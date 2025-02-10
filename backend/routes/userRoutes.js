import express from "express";
const router = express.Router();
import {
  getUsers,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// Protect all routes
router.use(protect);

// Admin routes
router.route("/").get(admin, getUsers);
router.route("/all").get(admin, getAllUsers);

// Routes som kräver admin eller superadmin
router.route("/:id/toggle").patch(admin, toggleUserStatus);
router.route("/").post(admin, createUser);
router.route("/:id").patch(admin, updateUser).delete(admin, deleteUser);

export default router;
