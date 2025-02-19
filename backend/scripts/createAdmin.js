const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB...");

    // Ta bort existerande admin-användare
    await User.deleteOne({ email: "admin@example.com" });
    console.log("Removed existing admin user if any");

    // Skapa ny admin-användare utan att hasha lösenordet manuellt
    const adminUser = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: "Admin123!", // Lösenordet kommer att hashas automatiskt av pre-save middleware
      role: "ADMIN",
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
