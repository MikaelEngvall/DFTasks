const Task = require("../models/Task");

const taskController = {
  // Skapa ny uppgift (endast admin)
  createTask: async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Endast administratörer kan skapa uppgifter" });
      }

      const { title, instructions, assignees, dueDate } = req.body;
      const newTask = new Task({
        title,
        instructions,
        assignees,
        dueDate,
        createdBy: req.user.id,
      });

      await newTask.save();
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ message: error.message });
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

  // Hämta alla uppgifter (admin ser alla, anställda ser bara sina)
  getTasks: async (req, res) => {
    try {
      let tasks;
      if (req.user.role === "admin") {
        tasks = await Task.find()
          .populate("assignees", "name email")
          .populate("createdBy", "name")
          .populate("comments.author", "name");
      } else {
        tasks = await Task.find({ assignees: req.user.id })
          .populate("assignees", "name email")
          .populate("createdBy", "name")
          .populate("comments.author", "name");
      }
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = taskController;
