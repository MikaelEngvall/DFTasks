import mongoose from "mongoose";
import { config } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env") });

const createSuperAdmin = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL is not defined in .env file");
    }

    await mongoose.connect(process.env.MONGODB_URL);

    // Ta bort existerande superadmin om den finns
    await User.deleteOne({ email: "mikael.engvall.me@gmail.com" });

    // Skapa ny superadmin
    const superAdmin = new User({
      name: "Mikael Engvall",
      email: "mikael.engvall.me@gmail.com",
      password: "Admin123!",
      role: "SUPERADMIN",
      preferredLanguage: "sv",
      isActive: true
    });

    await superAdmin.save();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

createSuperAdmin(); 