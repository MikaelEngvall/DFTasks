const Task = require("../models/Task");
const PendingTask = require("../models/PendingTask");
const { validateObjectId } = require("../utils/validation");

// Hämta alla uppgifter (för inloggad användare eller admin)
const getTasks = async (req, res) => {
  try {
    let tasks;
    // Om användaren är admin eller superadmin, hämta alla aktiva uppgifter
    if (req.user.role === "ADMIN" || req.user.role === "SUPERADMIN") {
      tasks = await Task.find({ isActive: true })
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email")
        .populate("comments.createdBy", "name email");
    } else {
      // För vanliga användare, hämta bara deras tilldelade uppgifter
      tasks = await Task.find({
        isActive: true,
        assignedTo: req.user._id,
      })
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email")
        .populate("comments.createdBy", "name email");
    }
    res.json({ tasks });
  } catch (error) {
    console.error("Error in getTasks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Hämta alla uppgifter (inklusive inaktiva)
const getAllTasks = async (req, res) => {
  try {
    // Kontrollera om användaren är admin eller superadmin
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("comments.createdBy", "name email");
    res.json({ tasks });
  } catch (error) {
    console.error("Error in getAllTasks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Hämta en specifik uppgift
const getTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("comments.createdBy", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Kontrollera behörighet
    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "SUPERADMIN" &&
      task.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(task);
  } catch (error) {
    console.error("Error in getTask:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Skapa ny uppgift
const createTask = async (req, res) => {
  try {
    // Kontrollera om användaren är admin eller superadmin
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const task = new Task({
      ...req.body,
      createdBy: req.user._id,
    });

    const savedTask = await task.save();
    const populatedTask = await Task.findById(savedTask._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.status(201).json({ task: populatedTask });
  } catch (error) {
    console.error("Error in createTask:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Uppdatera uppgift
const updateTask = async (req, res) => {
  try {
    // Kontrollera om användaren är admin eller superadmin
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("comments.createdBy", "name email");

    res.json({ task: updatedTask });
  } catch (error) {
    console.error("Error in updateTask:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Radera (inaktivera) uppgift
const deleteTask = async (req, res) => {
  try {
    // Kontrollera om användaren är admin eller superadmin
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.isActive = false;
    await task.save();

    res.json({ message: "Task deactivated successfully" });
  } catch (error) {
    console.error("Error in deleteTask:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Växla uppgiftsstatus
const toggleTaskStatus = async (req, res) => {
  try {
    // Kontrollera om användaren är admin eller superadmin
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.isActive = !task.isActive;
    await task.save();

    res.json({
      message: `Task ${
        task.isActive ? "activated" : "deactivated"
      } successfully`,
      task,
    });
  } catch (error) {
    console.error("Error in toggleTaskStatus:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Växla kommentarstatus
const toggleCommentStatus = async (req, res) => {
  try {
    // Kontrollera om användaren är admin eller superadmin
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { taskId, commentId } = req.params;

    if (!validateObjectId(taskId) || !validateObjectId(commentId)) {
      return res.status(400).json({ message: "Invalid task or comment ID" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.isActive = !comment.isActive;
    await task.save();

    res.json({
      message: `Comment ${
        comment.isActive ? "activated" : "deactivated"
      } successfully`,
      task,
    });
  } catch (error) {
    console.error("Error in toggleCommentStatus:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Lägg till kommentar
const addComment = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Kontrollera behörighet
    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "SUPERADMIN" &&
      task.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    task.comments.push({
      content: req.body.content,
      createdBy: req.user._id,
    });

    await task.save();

    const updatedTask = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("comments.createdBy", "name email");

    res.json({ task: updatedTask });
  } catch (error) {
    console.error("Error in addComment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Hämta alla väntande uppgifter
const getPendingTasks = async (req, res) => {
  try {
    console.log("Getting pending tasks...");
    console.log("User role:", req.user.role);
    console.log("User ID:", req.user._id);
    console.log("PendingTask model:", !!PendingTask);
    console.log(
      "PendingTask schema:",
      JSON.stringify(PendingTask.schema.paths, null, 2)
    );

    // Kontrollera om användaren är admin eller superadmin
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
      console.log("Access denied - user role not authorized");
      return res.status(403).json({ message: "Access denied" });
    }

    console.log("Attempting to find pending tasks...");
    const pendingTasks = await PendingTask.find({ status: "pending" }).sort({
      createdAt: -1,
    });
    console.log("Raw pending tasks:", JSON.stringify(pendingTasks, null, 2));
    console.log("Found pending tasks count:", pendingTasks.length);

    // Returnera konsekvent format
    res.json({ pendingTasks });
  } catch (error) {
    console.error("Error in getPendingTasks:", error);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation error", error: error.message });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Godkänn väntande uppgift
const approvePendingTask = async (req, res) => {
  try {
    // Kontrollera om användaren är admin eller superadmin
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { taskId } = req.params;
    const { assignedTo, dueDate } = req.body;

    if (!validateObjectId(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const pendingTask = await PendingTask.findById(taskId);
    if (!pendingTask) {
      return res.status(404).json({ message: "Pending task not found" });
    }

    // Skapa ny uppgift från den väntande uppgiften
    const task = new Task({
      title: pendingTask.title,
      description: pendingTask.description,
      assignedTo,
      dueDate,
      createdBy: req.user._id,
      status: "pending",
    });

    await task.save();

    // Uppdatera status på väntande uppgift
    pendingTask.status = "approved";
    await pendingTask.save();

    res.json({ message: "Task approved successfully", task });
  } catch (error) {
    console.error("Error in approvePendingTask:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
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
};
