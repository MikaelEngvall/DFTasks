const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("../models/User");

const createAdmin = async () => {
  try {
    // Anslut till MongoDB
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB...");

    // Ta bort befintlig admin
    await User.deleteOne({ email: "admin@example.com" });
    console.log("Removed existing admin user");

    // Skapa admin-användare
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Admin123!", salt);

    const adminUser = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    });

    await adminUser.save();
    console.log("Admin user created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

createAdmin();
