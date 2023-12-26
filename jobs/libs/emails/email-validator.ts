import { z } from 'zod';

export class EmailValidator {
  static isValid(email: string): boolean {
    return z.string().email().safeParse(email).success;
  }
}
