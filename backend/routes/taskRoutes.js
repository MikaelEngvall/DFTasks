// routes/taskRoutes.js

const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const auth = require("../middleware/auth");
const Task = require("../models/Task");

// Skydda alla routes med auth middleware
router.use(auth);

// CRUD routes
router.get("/", taskController.getTasks);
router.get("/assigned", taskController.getAssignedTasks);
router.post("/", taskController.postTask);
router.put("/:id", taskController.putTask);
router.delete("/:id", taskController.deleteTask);

// Specialroutes
router.put("/:id/status", taskController.updateTaskStatus);
router.post("/:id/comments", taskController.addComment);

module.exports = router;
