const mongoose = require("mongoose");
const PendingTask = require("../models/PendingTask");

const MONGODB_URL =
  "mongodb+srv://mikaelengvallmemongo:7HyfMQ8G2C26Pieh@cluster0.l0eqi.mongodb.net/dftasks?retryWrites=true&w=majority&appName=Cluster0";

const createTestPendingTask = async () => {
  try {
    await mongoose.connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB...");

    const testTask = new PendingTask({
      title: "Test felanmälan",
      description: "Detta är en testfelanmälan för att verifiera systemet",
      reporterName: "Test Testsson",
      reporterEmail: "test@example.com",
      reporterPhone: "0701234567",
      address: "Testgatan 1",
      apartmentNumber: "1001",
      status: "pending",
    });

    await testTask.save();
    console.log("Test pending task created successfully");

    const allTasks = await PendingTask.find();
    console.log("All pending tasks:", allTasks);

    process.exit(0);
  } catch (error) {
    console.error("Error creating test pending task:", error);
    process.exit(1);
  }
};

createTestPendingTask();
