const mongoose = require("mongoose");
const Task = require("../models/Task");
require("dotenv").config({ path: "../../.env" }); // Ensure the correct path to your .env file

async function createTask() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    const taskExists = await Task.findOne({
      description: "Landbrogatan 31A lgh 1301",
    });
    if (taskExists) {
      console.log("task already exists");
      process.exit(0);
    }

    const task = new Task({
      title: "Fix shower",
      description: "Landbrogatan 31A lgh 1301",
      status: "pending",
      assignedTo: "666666666666666666666666",
      dueDate: new Date("2025-01-21"),
      createdBy: "666666666666666666666666",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await task.save();
    console.log("Task created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error creating task:", error);
    process.exit(1);
  }
}

createTask();
