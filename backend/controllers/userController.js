const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userController = {
  // Get all users
  getUsers: async (req, res) => {
    try {
      const users = await User.find().select("-password"); // Exkludera lösenord
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  },

  // Get single user
  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Error fetching user" });
    }
  },

  // Create user
  createUser: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      // Validera indata
      if (!name || !email || !password) {
        return res.status(400).json({
          message: "Name, email and password are required",
        });
      }

      // Kontrollera om användaren redan finns
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: "A user with this email already exists",
        });
      }

      // Konvertera roll till uppercase
      const userRole = (role || "USER").toUpperCase();

      // Kryptera lösenord
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Skapa ny användare
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: userRole,
      });

      // Spara användaren
      const savedUser = await newUser.save();

      // Ta bort lösenord från svaret
      const userResponse = savedUser.toObject();
      delete userResponse.password;

      res.status(201).json(userResponse);
    } catch (error) {
      console.error("Error in createUser:", error);
      res.status(500).json({
        message: "Error creating user",
        error: error.message,
      });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      const userId = req.params.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      await user.save();

      const userResponse = user.toObject();
      delete userResponse.password;

      res.json(userResponse);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user" });
    }
  },

  // Registrera ny användare (endast admin)
  register: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      // Kontrollera om användaren är admin
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Endast administratörer kan skapa nya användare" });
      }

      // Kolla om användaren redan finns
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: "En användare med denna email finns redan",
        });
      }

      // Hasha lösenord
      const hashedPassword = await bcrypt.hash(password, 10);

      // Skapa ny användare
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: role || "employee",
      });

      await newUser.save();
      res.status(201).json({
        message: "Användare skapad framgångsrikt",
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({
        message: "Ett fel uppstod vid registrering",
        error: error.message,
      });
    }
  },

  // Login method
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validera indata
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Hitta användaren
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verifiera lösenord
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Skapa token med ACCESS_TOKEN_SECRET istället för JWT_SECRET
      const token = jwt.sign(
        {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
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

  // Hämta alla användare (endast admin)
  getAllUsers: async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          message: "Åtkomst nekad",
        });
      }

      const users = await User.find().select("-password");
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        message: "Ett fel uppstod vid hämtning av användare",
        error: error.message,
      });
    }
  },
};

module.exports = userController;
