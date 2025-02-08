const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");

const updateSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Ansluten till MongoDB...");

    const user = await User.findOne({ email: "mikael.engvall.me@gmail.com" });
    if (!user) {
      console.log("Användaren hittades inte");
      process.exit(1);
    }

    // Uppdatera användarens roll till SUPERADMIN
    user.role = "SUPERADMIN";
    await user.save();

    console.log("Användaren har uppdaterats till SUPERADMIN");
    process.exit(0);
  } catch (error) {
    console.error("Fel vid uppdatering av SUPERADMIN:", error);
    process.exit(1);
  }
};

updateSuperAdmin();
