import express from "express";
import { protect, admin, superAdmin } from "../middleware/authMiddleware.js";
import {
  getUsers,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", protect, admin, getUsers);
router.get("/all", protect, superAdmin, getAllUsers);
router.post("/", protect, admin, createUser);
router.put("/:id", protect, admin, updateUser);
router.delete("/:id", protect, admin, deleteUser);
router.patch("/:id/toggle-status", protect, admin, toggleUserStatus);

export default router;
