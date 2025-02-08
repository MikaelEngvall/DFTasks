//routes/authRoutes.js

const express = require("express");
const router = express.Router();
const {
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// Endast login tillåts, ingen signup
router.post("/login", login);

// Lösenordsåterställning
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
