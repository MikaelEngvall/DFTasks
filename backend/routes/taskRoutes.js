// routes/taskRoutes.js

const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const auth = require("../middleware/auth");

router.use(auth);

// Routes beginning with /api/tasks
router.post("/", taskController.createTask);
router.patch("/:id/status", taskController.updateTaskStatus);
router.post("/:id/comment", taskController.addComment);
router.get("/", taskController.getTasks);

// Hämta uppgifter tilldelade till inloggad användare
router.get("/assigned", taskController.getAssignedTasks);

module.exports = router;
