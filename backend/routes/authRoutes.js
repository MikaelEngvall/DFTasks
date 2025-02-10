//routes/authRoutes.js

import express from "express";
const router = express.Router();
import {
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

// Endast login tillåts, ingen signup
router.post("/login", login);

// Lösenordsåterställning
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
