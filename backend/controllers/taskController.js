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
      });

      const savedTask = await task.save();
      const populatedTask = await Task.findById(savedTask._id).populate(
        "assignedTo",
        "name email"
      );

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

  // Uppdatera uppgiftsstatus (anställda kan uppdatera sina egna uppgifter)
  updateTaskStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({ message: "Uppgift hittades inte" });
      }

      // Kontrollera om användaren är tilldelad uppgiften eller är admin
      if (req.user.role !== "admin" && !task.assignees.includes(req.user.id)) {
        return res.status(403).json({ message: "Åtkomst nekad" });
      }

      task.status = status;
      await task.save();
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Lägg till kommentar
  addComment: async (req, res) => {
    try {
      const { text } = req.body;
      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({ message: "Uppgift hittades inte" });
      }

      // Kontrollera om användaren är tilldelad uppgiften eller är admin
      if (req.user.role !== "admin" && !task.assignees.includes(req.user.id)) {
        return res.status(403).json({ message: "Åtkomst nekad" });
      }

      task.comments.push({
        text,
        author: req.user.id,
      });

      await task.save();
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = taskController;
