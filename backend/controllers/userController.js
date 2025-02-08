const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userController = {
  // Get all users
  getUsers: async (req, res) => {
    try {
      const users = await User.find({ isActive: true }).select("-password");
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

      // Kontrollera behörigheter för rollsättning
      const requestedRole = (role || "USER").toUpperCase();

      // SUPERADMIN kan skapa alla typer av användare
      if (req.user.role === "SUPERADMIN") {
        // Tillåt alla roller
      } else if (req.user.role === "ADMIN") {
        // Admin kan bara skapa USER
        if (requestedRole !== "USER") {
          return res.status(403).json({
            message: "Not authorized to create admin or superadmin users",
          });
        }
      } else {
        return res.status(403).json({
          message: "Not authorized to create users",
        });
      }

      // Kryptera lösenord
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Skapa ny användare
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: requestedRole,
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

      // Kontrollera behörigheter
      if (req.user.role !== "SUPERADMIN") {
        // Admin kan inte ändra andra admins eller superadmins
        if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
          return res.status(403).json({
            message: "Not authorized to modify admin or superadmin users",
          });
        }
        // Admin kan inte ändra någons roll till admin eller superadmin
        if (role === "ADMIN" || role === "SUPERADMIN") {
          return res.status(403).json({
            message: "Not authorized to assign admin or superadmin roles",
          });
        }
      } else {
        // Superadmin kan inte ändra sin egen roll
        if (
          user._id.toString() === req.user.id &&
          role &&
          role !== "SUPERADMIN"
        ) {
          return res.status(403).json({
            message: "Superadmin cannot change their own role",
          });
        }
      }

      // Update fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role.toUpperCase();
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      const updatedUser = await user.save();
      const userResponse = updatedUser.toObject();
      delete userResponse.password;

      res.json(userResponse);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({
        message: "Error updating user",
        error: error.message,
      });
    }
  },

  // Delete user (deactivate)
  deleteUser: async (req, res) => {
    try {
      const userToDelete = await User.findById(req.params.id);
      if (!userToDelete) {
        return res.status(404).json({ message: "User not found" });
      }

      // Kontrollera behörigheter
      if (req.user.role !== "SUPERADMIN") {
        // Admin kan inte radera andra admins eller superadmins
        if (
          userToDelete.role === "ADMIN" ||
          userToDelete.role === "SUPERADMIN"
        ) {
          return res.status(403).json({
            message: "Not authorized to delete admin or superadmin users",
          });
        }
      } else {
        // Superadmin kan inte radera sig själv
        if (userToDelete._id.toString() === req.user.id) {
          return res.status(403).json({
            message: "Superadmin cannot delete themselves",
          });
        }
      }

      userToDelete.isActive = false;
      await userToDelete.save();

      res.json({ message: "User deactivated successfully" });
    } catch (error) {
      console.error("Error deactivating user:", error);
      res.status(500).json({ message: "Error deactivating user" });
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
      console.log("Login attempt for:", email);

      // Validera indata
      if (!email || !password) {
        console.log("Missing email or password");
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Hitta användaren
      const user = await User.findOne({ email });
      if (!user) {
        console.log("User not found");
        return res.status(401).json({ message: "Invalid credentials" });
      }
      console.log("User found:", user.email);

      // Verifiera lösenord med matchPassword-metoden
      const isMatch = await user.matchPassword(password);
      console.log("Password match:", isMatch);

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
      if (req.user.role !== "ADMIN") {
        return res.status(403).json({
          message: "Åtkomst nekad",
        });
      }

      // Hämta alla användare, både aktiva och inaktiva
      const users = await User.find().select("-password");
      console.log("Fetched users:", users); // Debug-logg
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        message: "Ett fel uppstod vid hämtning av användare",
        error: error.message,
      });
    }
  },

  // Aktivera/inaktivera användare
  toggleUserStatus: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.isActive = !user.isActive;
      await user.save();

      res.json({
        message: `User ${
          user.isActive ? "activated" : "deactivated"
        } successfully`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Error toggling user status" });
    }
  },
};

module.exports = userController;
