const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");
const Task = require("../models/Task");

const migrateData = async () => {
  try {
    // Anslut till MongoDB
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB...");

    // Uppdatera alla användare
    const userResult = await User.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    console.log(`Updated ${userResult.modifiedCount} users`);

    // Uppdatera alla uppgifter
    const taskResult = await Task.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    console.log(`Updated ${taskResult.modifiedCount} tasks`);

    // Uppdatera alla kommentarer i uppgifter
    const tasks = await Task.find({ "comments.isActive": { $exists: false } });
    for (const task of tasks) {
      task.comments.forEach((comment) => {
        if (!comment.isActive) {
          comment.isActive = true;
        }
      });
      await task.save();
    }
    console.log(`Updated comments in ${tasks.length} tasks`);

    console.log("Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateData();
