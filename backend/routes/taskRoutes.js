// routes/taskRoutes.js

import express from "express";
const router = express.Router();
import {
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
} from "../controllers/taskController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// Skydda alla routes med auth middleware
router.use(protect);

// Status update route - tillåt både admin och tilldelade användare
router.patch("/:id/status", toggleTaskStatus);
router.patch("/:id/toggle-status", toggleTaskStatus);

// Pending task routes
router.route("/pending").get(admin, getPendingTasks);
router.route("/pending/:taskId/approve").post(admin, approvePendingTask);

// CRUD routes - tillåt både admin och superadmin
router
  .route("/")
  .get(getTasks) // Denna route hanterar nu showArchived-parametern
  .post(admin, createTask);

router.route("/all").get(admin, getAllTasks);

router
  .route("/:id")
  .get(getTask)
  .patch(admin, updateTask)
  .delete(admin, deleteTask);

router
  .route("/:taskId/comments/:commentId/toggle")
  .patch(admin, toggleCommentStatus);

router.route("/:id/comments").post(addComment);

export default router;
