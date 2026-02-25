import { validateEmailAndPassword, validatePassword, validateRequiredEmailAndPassword } from './auth.ts';

describe('validatePassword', () => {
  it('validates a correct password', () => {
    const result = validatePassword('Valid123');
    expect(result).toBeNull();
  });

  it('returns error for password missing uppercase letter', () => {
    const result = validatePassword('valid123');
    expect(result).toEqual({ password: ['error.field.password.missing-uppercase'] });
  });

  it('returns error for password missing lowercase letter', () => {
    const result = validatePassword('VALID123');
    expect(result).toEqual({ password: ['error.field.password.missing-lowercase'] });
  });

  it('returns error for password missing number', () => {
    const result = validatePassword('ValidPass');
    expect(result).toEqual({ password: ['error.field.password.missing-number'] });
  });

  it('returns error for password less than 8 characters', () => {
    const result = validatePassword('Val1');
    expect(result).toEqual({ password: ['error.field.password.min-length'] });
  });

  it('returns multiple errors for very weak password', () => {
    const result = validatePassword('invalid');
    expect(result).toEqual({
      password: [
        'error.field.password.min-length',
        'error.field.password.missing-uppercase',
        'error.field.password.missing-number',
      ],
    });
  });
});

describe('validateRequiredEmailAndPassword', () => {
  it('validates when both are provided', () => {
    const result = validateRequiredEmailAndPassword('test@example.com', 'password');
    expect(result).toBeNull();
  });

  it('returns error for empty email', () => {
    const result = validateRequiredEmailAndPassword('', 'password');
    expect(result).toEqual({ email: ['error.field.email.required'] });
  });

  it('returns error for empty password', () => {
    const result = validateRequiredEmailAndPassword('test@example.com', '');
    expect(result).toEqual({ password: ['error.field.password.required'] });
  });

  it('returns errors for both empty', () => {
    const result = validateRequiredEmailAndPassword('', '');
    expect(result).toEqual({
      email: ['error.field.email.required'],
      password: ['error.field.password.required'],
    });
  });
});

describe('validateEmailAndPassword', () => {
  it('validates correct email and password', () => {
    const result = validateEmailAndPassword('test@example.com', 'Valid123');
    expect(result).toBeNull();
  });

  it('returns error for empty email', () => {
    const result = validateEmailAndPassword('', 'Valid123');
    expect(result).toEqual({ email: ['error.field.email.required'] });
  });

  it('returns error for invalid email', () => {
    const result = validateEmailAndPassword('invalid-email', 'Valid123');
    expect(result).toEqual({ email: ['error.field.email.invalid'] });
  });

  it('returns error for invalid password', () => {
    const result = validateEmailAndPassword('test@example.com', 'invalid');
    expect(result).toEqual({
      password: [
        'error.field.password.min-length',
        'error.field.password.missing-uppercase',
        'error.field.password.missing-number',
      ],
    });
  });

  it('returns errors for both invalid email and password', () => {
    const result = validateEmailAndPassword('invalid-email', 'invalid');
    expect(result).toEqual({
      email: ['error.field.email.invalid'],
      password: [
        'error.field.password.min-length',
        'error.field.password.missing-uppercase',
        'error.field.password.missing-number',
      ],
    });
  });
});
