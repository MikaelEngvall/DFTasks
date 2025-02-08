// validations/index.js

const mongoose = require("mongoose");

// Funktion för att validera email-format med regex
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};

// Funktion för att validera enskilda formulärfält baserat på formulärgrupp
const validate = (group, name, value) => {
  if (!value) return "This field is required";

  switch (group) {
    case "signup":
      switch (name) {
        case "name":
          return null;
        case "email":
          return isValidEmail(value)
            ? null
            : "Please enter a valid email address";
        case "password":
          return value.length >= 4
            ? null
            : "Password should be at least 4 characters long";
        default:
          return null;
      }

    case "login":
      switch (name) {
        case "email":
          return isValidEmail(value)
            ? null
            : "Please enter a valid email address";
        case "password":
          return null;
        default:
          return null;
      }

    case "task":
      switch (name) {
        case "description":
          return value.length <= 100 ? null : "Max. limit is 100 characters.";
        default:
          return null;
      }

    default:
      return null;
  }
};

// Funktion för att validera flera fält och samla fel
const validateManyFields = (group, fields) => {
  const errors = [];
  for (const [field, value] of Object.entries(fields)) {
    const error = validate(group, field, value);
    if (error) errors.push({ field, error });
  }
  return errors;
};

const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

module.exports = {
  isValidEmail,
  validate,
  validateManyFields,
  validateObjectId,
};
