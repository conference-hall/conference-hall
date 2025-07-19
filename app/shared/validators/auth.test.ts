import { z } from 'zod';
import { EmailSchema, validateEmailAndPassword, validatePassword } from './auth.ts';

describe('validatePassword', () => {
  it('validates a correct password', () => {
    const result = validatePassword('Valid123');
    expect(result).toBeNull();
  });

  it('returns error for password missing uppercase letter', () => {
    const result = validatePassword('valid123');
    expect(result).toEqual({ password: ['Missing uppercase letter.'] });
  });

  it('returns error for password missing lowercase letter', () => {
    const result = validatePassword('VALID123');
    expect(result).toEqual({ password: ['Missing lowercase letter.'] });
  });

  it('returns error for password missing number', () => {
    const result = validatePassword('ValidPass');
    expect(result).toEqual({ password: ['Missing number.'] });
  });

  it('returns error for password less than 8 characters', () => {
    const result = validatePassword('Val1');
    expect(result).toEqual({ password: ['Minimum 8 characters.'] });
  });
});

describe('validateEmailAndPassword', () => {
  it('validates correct email and password', () => {
    const result = validateEmailAndPassword('test@example.com', 'Valid123');
    expect(result).toBeNull();
  });

  it('returns error for invalid email', () => {
    const result = validateEmailAndPassword('invalid-email', 'Valid123');
    expect(result).toEqual({ email: ['Invalid email address.'] });
  });

  it('returns error for invalid password', () => {
    const result = validateEmailAndPassword('test@example.com', 'invalid');
    expect(result).toEqual({ password: ['Minimum 8 characters. Missing uppercase letter. Missing number.'] });
  });

  it('returns errors for both invalid email and password', () => {
    const result = validateEmailAndPassword('invalid-email', 'invalid');
    expect(result).toEqual({
      email: ['Invalid email address.'],
      password: ['Minimum 8 characters. Missing uppercase letter. Missing number.'],
    });
  });
});

describe('EmailSchema', () => {
  it('validates email', async () => {
    const result = EmailSchema.safeParse({ email: 'john.doe@email.com' });
    expect(result.success && result.data).toEqual({ email: 'john.doe@email.com' });
  });

  it('validates mandatory and format', async () => {
    const result = EmailSchema.safeParse({ email: '' });

    expect(result.success).toEqual(false);
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      expect(fieldErrors.email).toEqual([
        'Invalid email address.',
        'Too small: expected string to have >=1 characters',
      ]);
    }
  });
});
