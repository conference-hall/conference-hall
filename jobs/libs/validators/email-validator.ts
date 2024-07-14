import { z } from 'zod';

// TODO: Add tests
export function isValidEmail(email: string): boolean {
  return z.string().email().safeParse(email).success;
}
