// validations/index.js

// Function to validate email format using a regular expression
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};

// Function to validate individual form fields based on the form group
export const validate = (group, name, value) => {
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

// Function to validate multiple fields and collect errors
const validateManyFields = (group, fields) => {
  const errors = [];
  for (const [field, value] of Object.entries(fields)) {
    const error = validate(group, field, value);
    if (error) errors.push({ field, error });
  }
  return errors;
};

export default validateManyFields;
