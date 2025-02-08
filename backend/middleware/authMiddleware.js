const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Skydda routes - verifiera token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Hämta token från header
      token = req.headers.authorization.split(" ")[1];

      // Verifiera token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // Hämta användarinfo (exkludera lösenord)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        throw new Error("Not authorized, user not found");
      }

      // Kontrollera om användaren är aktiv
      if (!req.user.isActive) {
        res.status(401);
        throw new Error("Not authorized, user is inactive");
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
};

module.exports = { protect, admin };
