import User from "../models/User.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("Creating user with role:", role);
    console.log("Current user role:", req.user.role);

    if (!name || !email || !password) {
      console.log("Missing required fields:", { name, email, password });
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({
        message: "A user with this email already exists",
      });
    }

    const requestedRole = (role || "USER").toUpperCase();
    console.log("Requested role after normalization:", requestedRole);

    if (req.user.role === "SUPERADMIN") {
      console.log("User is SUPERADMIN, allowing creation of all roles");
    } else if (req.user.role === "ADMIN") {
      console.log("User is ADMIN, checking role restrictions");
      if (requestedRole !== "USER") {
        console.log("ADMIN attempted to create non-USER role:", requestedRole);
        return res.status(403).json({
          message: "Not authorized to create admin or superadmin users",
        });
      }
    } else {
      console.log("Unauthorized user attempted to create user:", req.user.role);
      return res.status(403).json({
        message: "Not authorized to create users",
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: requestedRole,
    });

    const savedUser = await newUser.save();
    console.log("User created successfully:", savedUser.email);

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
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, password, role, preferredLanguage } = req.body;
    const userId = req.params.id;

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: "Användaren hittades inte" });
    }

    // Kontrollera behörigheter
    if (req.user.role === "USER") {
      // Användare kan bara uppdatera sina egna uppgifter
      if (req.user.id !== userId) {
        return res.status(403).json({
          message:
            "Du har inte behörighet att ändra andra användares uppgifter",
        });
      }
      // Användare kan inte ändra sin roll
      if (role && role !== userToUpdate.role) {
        return res.status(403).json({
          message: "Du har inte behörighet att ändra din roll",
        });
      }
    } else if (req.user.role === "ADMIN") {
      // Admin kan inte ändra superadmin eller andra admin
      if (
        userToUpdate.role === "SUPERADMIN" ||
        (userToUpdate.role === "ADMIN" && req.user.id !== userId)
      ) {
        return res.status(403).json({
          message: "Du har inte behörighet att ändra denna användare",
        });
      }
      // Admin kan inte sätta admin eller superadmin roll
      if (
        role &&
        (role === "SUPERADMIN" || (role === "ADMIN" && req.user.id !== userId))
      ) {
        return res.status(403).json({
          message: "Du har inte behörighet att tilldela denna roll",
        });
      }
    }
    // SUPERADMIN har full behörighet

    // Kontrollera om e-postadressen redan finns
    if (email && email !== userToUpdate.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          message: "En användare med denna e-postadress finns redan",
        });
      }
    }

    // Uppdatera fälten
    if (name) userToUpdate.name = name;
    if (email) userToUpdate.email = email;
    if (preferredLanguage) userToUpdate.preferredLanguage = preferredLanguage;

    // Endast tillåt rolluppdatering om användaren har rätt behörighet
    if (
      role &&
      (req.user.role === "SUPERADMIN" ||
        (req.user.role === "ADMIN" && req.user.id === userId))
    ) {
      userToUpdate.role = role.toUpperCase();
    }

    // Hantera lösenordsuppdatering
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      userToUpdate.password = await bcryptjs.hash(password, salt);
    }

    const updatedUser = await userToUpdate.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      message: "Ett fel uppstod vid uppdatering av användaren",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.role !== "SUPERADMIN") {
      if (userToDelete.role === "ADMIN" || userToDelete.role === "SUPERADMIN") {
        return res.status(403).json({
          message: "Not authorized to delete admin or superadmin users",
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
};

export const toggleUserStatus = async (req, res) => {
  try {
    const userToToggle = await User.findById(req.params.id);
    if (!userToToggle) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.role !== "SUPERADMIN") {
      if (userToToggle.role === "ADMIN" || userToToggle.role === "SUPERADMIN") {
        return res.status(403).json({
          message: "Not authorized to modify admin or superadmin users",
        });
      }
    }

    userToToggle.isActive = !userToToggle.isActive;
    await userToToggle.save();

    res.json({
      message: "User status toggled successfully",
      user: userToToggle,
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({ message: "Error toggling user status" });
  }
};
