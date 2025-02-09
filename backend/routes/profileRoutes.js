// routes/profileRoutes.js

const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
} = require("../controllers/profileControllers");
const { protect } = require("../middleware/authMiddleware");

// Routes beginning with /api/profile
router.get("/", protect, getProfile);
router.patch("/", protect, updateProfile);

module.exports = router;
