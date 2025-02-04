const Task = require("../models/Task");

const taskController = {
  // Hämta alla uppgifter
  getTasks: async (req, res) => {
    try {
      const tasks = await Task.find()
        .populate("assignedUsers") // Ensure this line is correct
        .populate("createdBy", "name email")
        .populate("comments.createdBy", "name email")
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
      const { title, description, status, assignedUsers, dueDate } = req.body;

      // Log the received data
      console.log("Received data:", req.body);

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
        assignedUsers: assignedUsers || [], // Ensure this line is correct
        dueDate,
        createdBy: req.user.id,
      });

      const savedTask = await task.save();
      const populatedTask = await Task.findById(savedTask._id)
        .populate("assignedUsers", "name email") // Ensure this line is correct
        ..populate("createdBy", "name email")
        .populate("comments.createdBy", "name email");

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
      const { title, description, status, assignedUsers, dueDate } = req.body;
      const taskId = req.params.id;

      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        {
          title,
          description,
          status,
          assignedUsers: assignedUsers || [], // Ensure this line is correct
          dueDate,
        },
        { new: true }
      )
        .populate("assignedUsers", "name email") // Ensure this line is correct
        .populate("createdBy", "name email")
        .populate("comments.createdBy", "name email");

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
      const tasks = await Task.find({ assignedUsers: req.user.id }) // Ensure this line is correct
        .populate("assignedUsers", "name email") // Ensure this line is correct
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
      )
        .populate("assignedUsers", "name email") // Ensure this line is correct
        .populate("createdBy", "name email")
        .populate("comments.createdBy", "name email");

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
      )
        .populate("assignedUsers", "name email") // Ensure this line is correct
        .populate("createdBy", "name email")
        .populate("comments.createdBy", "name email");

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
