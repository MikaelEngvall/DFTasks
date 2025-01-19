// backend/controllers/authControllers.js
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { createAccessToken } = require("../utils/token");
const { isValidEmail } = require("../utils/validation");

exports.signup = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log request data

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log("Validation failed: Missing fields");
      return res.status(400).json({ msg: "Please fill all the fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("Validation failed: User already exists");
      return res.status(400).json({ msg: "This email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    const user = await User.create({ name, email, password: hashedPassword });
    console.log("User created:", user);

    return res
      .status(200)
      .json({ msg: "Congratulations! Account created successfully." });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter all details" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "This email is not registered" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Password incorrect" });
    }

    const token = createAccessToken({ id: user._id });

    res.status(200).json({
      token,
      user: { ...user.toObject(), password: undefined },
      msg: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};
