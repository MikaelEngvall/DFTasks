import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { config } from "dotenv";
import { startEmailListener } from "./utils/emailListener.js";

// Ladda miljövariabler
config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3000/dftasks",
      "http://localhost:3000/api",
      "http://localhost:5000",
      "http://localhost:5000/api",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Methods",
    ],
  })
);

// Routes
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import translateRoutes from "./routes/translateRoutes.js";

// API routes with /api prefix
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/translate", translateRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Något gick fel!" });
});

// Connect to MongoDB and start email listener
mongoose
  .connect(process.env.MONGODB_URL)
  .then(async () => {
    console.log("MongoDB connected...");
    startEmailListener();
    console.log("Email listener started...");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Backend is running on port ${port}`);
});
