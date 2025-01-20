//routes/authRoutes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Endast login tillåts, ingen signup
router.post("/login", userController.login);

module.exports = router;
