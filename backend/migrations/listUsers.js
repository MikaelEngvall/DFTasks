const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");

const listUsers = async () => {
  try {
    // Anslut till MongoDB
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB...");

    // Hämta alla användare
    const users = await User.find().select("-password");
    console.log("Users in database:");
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Error listing users:", error);
    process.exit(1);
  }
};

listUsers();
