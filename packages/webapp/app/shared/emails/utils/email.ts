import { z } from 'zod';

export function isValidEmail(email: string): boolean {
  return z.email().safeParse(email).success;
}
