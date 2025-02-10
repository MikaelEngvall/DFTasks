import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      // Kontrollera om användaren är aktiv
      if (!req.user.isActive) {
        return res
          .status(401)
          .json({ message: "Not authorized, user is inactive" });
      }

      next();
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "ADMIN" || req.user.role === "SUPERADMIN")
  ) {
    next();
  } else {
    return res.status(403).json({ message: "Not authorized as an admin" });
  }
};

// Superadmin middleware
const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === "SUPERADMIN") {
    next();
  } else {
    return res.status(403).json({ message: "Not authorized as a superadmin" });
  }
};

export { protect, admin, superAdmin };
