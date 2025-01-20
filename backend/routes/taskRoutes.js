// routes/taskRoutes.js

const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const auth = require("../middleware/auth");

// Routes beginning with /api/tasks
router.post("/", auth, taskController.createTask);
router.patch("/:id/status", auth, taskController.updateTaskStatus);
router.post("/:id/comment", auth, taskController.addComment);
router.get("/", auth, taskController.getTasks);

module.exports = router;
