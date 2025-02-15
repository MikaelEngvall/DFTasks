import mongoose from "mongoose";
import { config } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env") });

const verifyUser = async (email) => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL is not defined in .env file");
    }

    await mongoose.connect(process.env.MONGODB_URL);
    
    const user = await User.findOne({ email }).select("-password");
    
    if (!user) {
      console.log("No user found with email:", email);
      process.exit(1);
    }

    console.log("\nUser details:");
    console.log("-------------");
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Active:", user.isActive);
    console.log("Language:", user.preferredLanguage);
    console.log("Created:", user.createdAt);
    console.log("-------------\n");

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

// Kör med email som parameter
verifyUser("mikael.engvall.me@gmail.com"); 