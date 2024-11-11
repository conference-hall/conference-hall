import { isValidEmail } from './email.ts';

describe('Email validator', () => {
  it('returns true when email is valid', () => {
    const isValid = isValidEmail('john@email.com');
    expect(isValid).toBe(true);
  });

  it('returns false when email is not valid', () => {
    const isValid = isValidEmail('bademail');
    expect(isValid).toBe(false);
  });
});
