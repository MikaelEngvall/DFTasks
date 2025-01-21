const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config({ path: "../../.env" }); // Ensure the correct path to your .env file

async function createAdmin() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    const adminExists = await User.findOne({
      email: "mikael.engvall.me@gmail.com",
    });
    if (adminExists) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = new User({
      name: "Mikael Engvall",
      email: "mikael.engvall.me@gmail.com",
      password: hashedPassword,
      role: "ADMIN",
    });

    await admin.save();
    console.log("Admin user created successfully");
    console.log("Email: mikael.engvall.me@gmail.com");
    console.log("Password: admin123");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();

const jwt = require("jsonwebtoken");

const userController = {
  // Login method
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const user = await User.findOne({ email });
      if (!user) {
        console.log("User not found");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("Password does not match");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log("Password matches");

      const token = jwt.sign(
        { id: user._id, name: user.name, email: user.email, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  },
};

module.exports = userController;
