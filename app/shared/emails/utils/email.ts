import { z } from 'zod/v4';

export function isValidEmail(email: string): boolean {
  return z.email().safeParse(email).success;
}
