const Task = require("../models/Task");

const taskController = {
  // Hämta alla uppgifter
  getTasks: async (req, res) => {
    try {
      const tasks = await Task.find()
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });
      res.json(tasks);
    } catch (error) {
      console.error("Error in getTasks:", error);
      res.status(500).json({ message: "Error fetching tasks" });
    }
  },

  // Skapa ny uppgift
  createTask: async (req, res) => {
    try {
      const { title, description, status, assignedTo, dueDate } = req.body;

      // Validera indata
      if (!title || !dueDate) {
        return res
          .status(400)
          .json({ message: "Title and due date are required" });
      }

      const task = new Task({
        title,
        description,
        status: status || "new",
        assignedTo: assignedTo || null,
        dueDate,
        createdBy: req.user.id,
      });

      const savedTask = await task.save();
      const populatedTask = await Task.findById(savedTask._id)
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");

      res.status(201).json(populatedTask);
    } catch (error) {
      console.error("Error in createTask:", error);
      res.status(500).json({
        message: "Error creating task",
        error: error.message,
      });
    }
  },

  // Uppdatera uppgift
  updateTask: async (req, res) => {
    try {
      const { title, description, status, assignedTo, dueDate } = req.body;
      const taskId = req.params.id;

      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        {
          title,
          description,
          status,
          assignedTo: assignedTo || null,
          dueDate,
        },
        { new: true }
      ).populate("assignedTo", "name email");

      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json(updatedTask);
    } catch (error) {
      console.error("Error in updateTask:", error);
      res.status(500).json({ message: "Error updating task" });
    }
  },

  // Ta bort uppgift
  deleteTask: async (req, res) => {
    try {
      const taskId = req.params.id;
      const deletedTask = await Task.findByIdAndDelete(taskId);

      if (!deletedTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error in deleteTask:", error);
      res.status(500).json({ message: "Error deleting task" });
    }
  },

  // Hämta uppgifter tilldelade till en specifik användare
  getAssignedTasks: async (req, res) => {
    try {
      const tasks = await Task.find({ assignedTo: req.user.id })
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });
      res.json(tasks);
    } catch (error) {
      console.error("Error in getAssignedTasks:", error);
      res.status(500).json({ message: "Error fetching assigned tasks" });
    }
  },

  // Uppdatera uppgiftsstatus
  updateTaskStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const taskId = req.params.id;

      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { status },
        { new: true }
      ).populate("assignedTo comments.createdBy", "name email");

      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task status:", error);
      res.status(500).json({ message: "Error updating task status" });
    }
  },

  // Lägg till kommentar
  addComment: async (req, res) => {
    try {
      const { content } = req.body;
      const taskId = req.params.id;

      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        {
          $push: {
            comments: {
              content,
              createdBy: req.user.id,
            },
          },
        },
        { new: true }
      ).populate("assignedTo comments.createdBy", "name email");

      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json(updatedTask);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Error adding comment" });
    }
  },
};

module.exports = taskController;
