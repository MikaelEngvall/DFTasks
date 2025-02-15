// Ta bort zod import
// import { z } from 'zod';

// Ta bort zod schemas
// const emailSchema = z.string()...
// const passwordSchema = z.string()...

export const validateEmail = (email) => {
  const emailRegex = /\S+@\S+\.\S+/;
  if (!email) {
    return { isValid: false, error: 'E-post krävs' };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Ogiltig e-postadress' };
  }
  return { isValid: true };
};

export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Lösenord krävs' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Lösenordet måste vara minst 8 tecken' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Lösenordet måste innehålla minst en versal' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Lösenordet måste innehålla minst en gemen' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Lösenordet måste innehålla minst en siffra' };
  }
  return { isValid: true };
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