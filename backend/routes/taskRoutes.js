// routes/taskRoutes.js

const express = require("express");
const router = express.Router();
const {
  getTasks,
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  toggleCommentStatus,
  addComment,
} = require("../controllers/taskController");
const { protect, admin } = require("../middleware/authMiddleware");
const Task = require("../models/Task");

// Skydda alla routes med auth middleware
router.use(protect);

// CRUD routes
router.route("/").get(getTasks).post(admin, createTask);
router.route("/all").get(admin, getAllTasks);
router.route("/:id").get(getTask).put(admin, updateTask);
router.route("/:id/status").put(admin, toggleTaskStatus);
router.route("/:id/toggle").put(admin, toggleTaskStatus);
router
  .route("/:taskId/comments/:commentId/toggle")
  .put(admin, toggleCommentStatus);
router.route("/:id/comments").post(addComment);

// Uppdatera delete route för att använda den nya inaktiveringsfunktionen
router.route("/:id").delete(admin, deleteTask);

module.exports = router;
