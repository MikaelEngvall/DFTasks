const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userController = {
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

  // Logga in
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Login attempt for:", email); // Debugging

      if (!email || !password) {
        return res.status(400).json({
          message: "Email och lösenord krävs",
        });
      }

      const user = await User.findOne({ email });
      console.log("User found:", user ? "yes" : "no"); // Debugging

      if (!user) {
        return res.status(401).json({
          message: "Felaktig email eller lösenord",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password match:", isMatch ? "yes" : "no"); // Debugging

      if (!isMatch) {
        return res.status(401).json({
          message: "Felaktig email eller lösenord",
        });
      }

      // Använd ACCESS_TOKEN_SECRET istället för JWT_SECRET
      const token = jwt.sign(
        {
          id: user._id,
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
      console.error("Login error details:", error); // Mer detaljerad felloggning
      res.status(500).json({
        message: "Ett fel uppstod vid inloggning",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
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
