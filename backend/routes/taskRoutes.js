// routes/taskRoutes.js

const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const auth = require("../middleware/auth");
const Task = require("../models/Task");

// Skydda alla routes med auth middleware
router.use(auth);

// Routes beginning with /api/tasks
router.post("/", async (req, res) => {
  const { title, description, assignedUsers } = req.body; // Ensure this line is correct
  try {
    const newTask = new Task({ title, description, assignedUsers }); // Ensure this line is correct
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const { title, description, assignedUsers } = req.body; // Ensure this line is correct
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, assignedUsers }, // Ensure this line is correct
      { new: true }
    );
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", taskController.deleteTask);
router.get("/", taskController.getTasks);

// Hämta uppgifter tilldelade till inloggad användare
router.get("/assigned", taskController.getAssignedTasks);

// Nya routes
router.put("/:id/status", taskController.updateTaskStatus);
router.post("/:id/comments", taskController.addComment);

module.exports = router;
