import { validateEmail, validatePassword, validateAuthInput } from '../validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com').isValid).toBe(true);
      expect(validateEmail('test.name@domain.co.uk').isValid).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('test@').isValid).toBe(false);
      expect(validateEmail('test@domain').isValid).toBe(false);
      expect(validateEmail('test.com').isValid).toBe(false);
    });

    it('should return appropriate error messages', () => {
      const result = validateEmail('invalid');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Ogiltig e-postadress');
    });
  });

  // Fler tester...
}); 