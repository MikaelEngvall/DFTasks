import mongoose from "mongoose";
import { config } from "dotenv";
import User from "../models/User.js";
import Task from "../models/Task.js";

config();

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
    let commentCount = 0;

    for (const task of tasks) {
      let updated = false;
      task.comments.forEach((comment) => {
        if (comment.isActive === undefined) {
          comment.isActive = true;
          commentCount++;
          updated = true;
        }
      });
      if (updated) {
        await task.save();
      }
    }
    console.log(`Updated ${commentCount} comments in ${tasks.length} tasks`);

    console.log("Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateData();
