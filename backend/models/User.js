//models.Users.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: ["USER", "ADMIN", "SUPERADMIN"],
        message: "{VALUE} is not a valid role",
      },
      default: "USER",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    joiningTime: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true,
  }
);

// Hash lösenord före sparande
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Metod för att jämföra lösenord
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Metod för att hantera misslyckade inloggningsförsök
userSchema.methods.incrementLoginAttempts = async function () {
  // Öka antalet misslyckade försök
  this.failedLoginAttempts += 1;

  // Om användaren har nått max antal försök, lås kontot i 1 timme
  if (this.failedLoginAttempts >= 5) {
    this.lockUntil = Date.now() + 3600000; // 1 timme
  }

  await this.save();
};

// Metod för att återställa misslyckade inloggningsförsök
userSchema.methods.resetLoginAttempts = async function () {
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
  this.lastLogin = Date.now();
  await this.save();
};

const User = mongoose.model("User", userSchema);
module.exports = User;
