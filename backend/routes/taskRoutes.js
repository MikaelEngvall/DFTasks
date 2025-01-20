// routes/taskRoutes.js

const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const auth = require("../middleware/auth");

// Skydda alla routes med auth middleware
router.use(auth);

// Routes beginning with /api/tasks
router.post("/", taskController.createTask);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);
router.get("/", taskController.getTasks);

// Hämta uppgifter tilldelade till inloggad användare
router.get("/assigned", taskController.getAssignedTasks);

// Nya routes
router.put("/:id/status", taskController.updateTaskStatus);
router.post("/:id/comments", taskController.addComment);

module.exports = router;
