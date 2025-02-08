const mongoose = require("mongoose");
require("dotenv").config();
const PendingTask = require("../models/PendingTask");

const listPendingTasks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Ansluten till MongoDB...");

    const pendingTasks = await PendingTask.find();
    console.log("Väntande uppgifter i databasen:");
    console.log(JSON.stringify(pendingTasks, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Fel vid listning av väntande uppgifter:", error);
    process.exit(1);
  }
};

listPendingTasks();
