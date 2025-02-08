const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB...");

    const user = await User.findOne({ email: "mikael.engvall.me@gmail.com" });
    if (!user) {
      console.log("User not found");
      process.exit(1);
    }

    // Sätt nytt lösenord
    user.password = "Admin123!"; // Detta kommer att hashas av pre-save middleware
    await user.save();

    console.log("Password reset successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error resetting password:", error);
    process.exit(1);
  }
};

resetPassword();
