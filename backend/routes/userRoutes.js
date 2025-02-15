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
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.get("/", protect, admin, getUsers);
router.get("/all", protect, superAdmin, getAllUsers);
router.post("/", protect, admin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Kontrollera om användaren redan finns
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Skapa ny användare med hashat lösenord
    const user = new User({
      name,
      email,
      password, // User-modellen kommer att hasha detta automatiskt via pre-save hook
      role: role.toUpperCase(),
    });

    const savedUser = await user.save();
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});
router.put("/:id", protect, admin, updateUser);
router.delete("/:id", protect, admin, deleteUser);
router.patch("/:id/toggle-status", protect, admin, toggleUserStatus);

export default router;
