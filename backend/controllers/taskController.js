const Task = require("../models/Task");
const mongoose = require("mongoose");

// Enkel validering av MongoDB ObjectId
const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

exports.getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === "ADMIN") {
      tasks = await Task.find()
        .populate("assignedTo", "name")
        .populate("comments.createdBy", "name");
    } else {
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate("assignedTo", "name")
        .populate("comments.createdBy", "name");
    }
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

exports.getTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.taskId)) {
      return res.status(400).json({ status: false, msg: "Task id not valid" });
    }

    const task = await Task.findOne({
      user: req.user.id,
      _id: req.params.taskId,
    });
    if (!task) {
      return res.status(400).json({ status: false, msg: "No task found.." });
    }
    res
      .status(200)
      .json({ task, status: true, msg: "Task found successfully.." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

exports.getAssignedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id }).populate(
      "assignedTo",
      "name"
    );
    res.status(200).json({
      tasks,
      status: true,
      msg: "Assigned tasks found successfully..",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

exports.postTask = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ status: false, msg: "Only admins can create tasks" });
    }

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

exports.putTask = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ status: false, msg: "Only admins can update tasks" });
    }

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

    res
      .status(200)
      .json({ task, status: true, msg: "Task updated successfully.." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ status: false, msg: "Only admins can delete tasks" });
    }

    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ status: false, msg: "Invalid task ID" });
    }

    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ status: false, msg: "Task not found" });
    }

    res.status(200).json({ status: true, msg: "Task deleted successfully.." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, msg: "Internal Server Error" });
  }
};

exports.updateTaskStatus = async (req, res) => {
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

exports.addComment = async (req, res) => {
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
    });

    await task.save();
    const updatedTask = await Task.findById(task._id)
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
