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
  getPendingTasks,
  approvePendingTask,
} = require("../controllers/taskController");
const { protect, admin, superadmin } = require("../middleware/authMiddleware");
const Task = require("../models/Task");

// Skydda alla routes med auth middleware
router.use(protect);

// Status update route - tillåt både admin och tilldelade användare
router.patch("/:id/status", toggleTaskStatus);

// Pending task routes
router.route("/pending").get(admin, getPendingTasks);
router.route("/pending/:taskId/approve").post(admin, approvePendingTask);

// CRUD routes - tillåt både admin och superadmin
router.route("/").get(getTasks).post(admin, createTask);
router.route("/all").get(admin, getAllTasks);
router
  .route("/:id")
  .get(getTask)
  .put(admin, updateTask)
  .delete(admin, deleteTask);
router
  .route("/:taskId/comments/:commentId/toggle")
  .put(admin, toggleCommentStatus);
router.route("/:id/comments").post(addComment);

module.exports = router;
