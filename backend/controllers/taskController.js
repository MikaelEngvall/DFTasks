const Task = require("../models/Task");
const mongoose = require("mongoose");

// Enkel validering av MongoDB ObjectId
const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Hämta aktiva uppgifter
const getTasks = async (req, res) => {
  try {
    let query = { isActive: true };
    if (req.user.role !== "ADMIN") {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name")
      .populate("comments.createdBy", "name");

    res.status(200).json({
      tasks: tasks || [],
      status: true,
      msg: "Tasks found successfully..",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

// Hämta alla uppgifter (inklusive inaktiva) - endast för admin
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name")
      .populate("comments.createdBy", "name");

    res.status(200).json({
      tasks: tasks || [],
      status: true,
      msg: "All tasks found successfully..",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

// Hämta en specifik uppgift
const getTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ status: false, msg: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name")
      .populate("comments.createdBy", "name");

    if (!task) {
      return res.status(404).json({ status: false, msg: "Task not found" });
    }

    if (
      req.user.role !== "ADMIN" &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ status: false, msg: "Not authorized to view this task" });
    }

    res.status(200).json({
      task,
      status: true,
      msg: "Task found successfully..",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

// Skapa en ny uppgift
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, status } = req.body;
    if (!title || !description || !dueDate) {
      return res
        .status(400)
        .json({ status: false, msg: "Required fields missing" });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      dueDate,
      status: status || "pending",
      createdBy: req.user._id,
      isActive: true,
    });

    const populatedTask = await task.populate("assignedTo", "name");
    res.status(201).json({
      task: populatedTask,
      status: true,
      msg: "Task created successfully..",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

// Uppdatera en uppgift
const updateTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ status: false, msg: "Invalid task ID" });
    }

    const { title, description, assignedTo, dueDate, status } = req.body;
    if (!title || !description || !dueDate) {
      return res
        .status(400)
        .json({ status: false, msg: "Required fields missing" });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, assignedTo, dueDate, status },
      { new: true }
    ).populate("assignedTo", "name");

    if (!task) {
      return res.status(404).json({ status: false, msg: "Task not found" });
    }

    res.status(200).json({
      task,
      status: true,
      msg: "Task updated successfully..",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

// Inaktivera en uppgift (istället för att ta bort den)
const deleteTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ status: false, msg: "Invalid task ID" });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ status: false, msg: "Task not found" });
    }

    res.status(200).json({
      status: true,
      msg: "Task deactivated successfully..",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

// Växla uppgiftens aktiva status
const toggleTaskStatus = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ status: false, msg: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ status: false, msg: "Task not found" });
    }

    task.isActive = !task.isActive;
    await task.save();

    res.status(200).json({
      task,
      status: true,
      msg: `Task ${task.isActive ? "activated" : "deactivated"} successfully..`,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

// Växla kommentarens aktiva status
const toggleCommentStatus = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;

    if (!validateObjectId(taskId) || !validateObjectId(commentId)) {
      return res.status(400).json({ status: false, msg: "Invalid ID" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ status: false, msg: "Task not found" });
    }

    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ status: false, msg: "Comment not found" });
    }

    comment.isActive = !comment.isActive;
    await task.save();

    res.status(200).json({
      task,
      status: true,
      msg: `Comment ${
        comment.isActive ? "activated" : "deactivated"
      } successfully..`,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

// Lägg till en kommentar
const addComment = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ status: false, msg: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ status: false, msg: "Task not found" });
    }

    if (
      req.user.role !== "ADMIN" &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ status: false, msg: "Not authorized to comment on this task" });
    }

    const { content } = req.body;
    if (!content) {
      return res
        .status(400)
        .json({ status: false, msg: "Comment content is required" });
    }

    task.comments.push({
      content,
      createdBy: req.user._id,
      isActive: true,
    });

    await task.save();
    const updatedTask = await task
      .populate("assignedTo", "name")
      .populate("comments.createdBy", "name");

    res.status(200).json({
      task: updatedTask,
      status: true,
      msg: "Comment added successfully..",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

// Uppdatera uppgiftens status
const updateTaskStatus = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ status: false, msg: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ status: false, msg: "Task not found" });
    }

    if (
      req.user.role !== "ADMIN" &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ status: false, msg: "Not authorized to update this task" });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ status: false, msg: "Status is required" });
    }

    task.status = status;
    await task.save();
    const updatedTask = await task.populate("assignedTo", "name");

    res.status(200).json({
      task: updatedTask,
      status: true,
      msg: "Task status updated successfully..",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
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
  updateTaskStatus,
};
