// routes/profileRoutes.js

import express from "express";
const router = express.Router();
import {
  getProfile,
  updateProfile,
} from "../controllers/profileControllers.js";
import { protect } from "../middleware/authMiddleware.js";

// Routes beginning with /api/profile
router.get("/", protect, getProfile);
router.patch("/", protect, updateProfile);

export default router;
