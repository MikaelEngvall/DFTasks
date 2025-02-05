const mongoose = require("mongoose");
const User = require("../models/User"); // Justera sökvägen om nödvändigt
const Task = require("../models/Task"); // Justera sökvägen om nödvändigt

// Anslut till databasen
mongoose
  .connect(
    "mongodb+srv://mikaelengvallmemongo:7HyfMQ8G2C26Pieh@cluster0.l0eqi.mongodb.net/dftasks?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

// Funktion för att skapa en task
const createTask = async () => {
  try {
    // Hämta en användare (t.ex. den första användaren)
    const user = await User.findOne(); // Du kan justera detta för att hämta en specifik användare
    if (!user) {
      console.log("No user found");
      return;
    }

    // Skapa en ny task
    const newTask = new Task({
      title: "Sample Task",
      description: "This is a sample task description.",
      status: "pending",
      assignedTo: user._id, // Tilldela uppgiften till den hämtade användaren
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Sätt förfallodatum till en vecka framåt
      createdBy: user._id, // Om du vill sätta skaparen till samma användare
    });

    // Spara tasken i databasen
    await newTask.save();
    console.log("Task created successfully:", newTask);
  } catch (error) {
    console.error("Error creating task:", error);
  } finally {
    // Stäng databaskopplingen
    mongoose.connection.close();
  }
};

// Kör funktionen
createTask();
