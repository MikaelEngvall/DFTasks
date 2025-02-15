import { z } from 'zod';

// Validation schemas
const emailSchema = z.string().email({
  message: "Ogiltig e-postadress"
});

const passwordSchema = z.string()
  .min(8, "Lösenordet måste vara minst 8 tecken")
  .regex(/[A-Z]/, "Lösenordet måste innehålla minst en versal")
  .regex(/[a-z]/, "Lösenordet måste innehålla minst en gemen")
  .regex(/[0-9]/, "Lösenordet måste innehålla minst en siffra");

export const validateEmail = (email) => {
  try {
    emailSchema.parse(email);
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error.errors[0]?.message 
    };
  }
};

export const validatePassword = (password) => {
  try {
    passwordSchema.parse(password);
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error.errors[0]?.message 
    };
  }
};

export const validateAuthInput = (email, password) => {
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);

  return {
    isValid: emailValidation.isValid && passwordValidation.isValid,
    errors: {
      email: emailValidation.error,
      password: passwordValidation.error
    }
  };
}; 