import { z } from 'zod';
import type { SubmissionErrors } from '~/types/errors.types.ts';

const emailSchema = z.string().email({ message: 'Invalid email address.' });

const passwordSchema = z
  .string()
  .min(8, { message: 'Minimum 8 characters.' })
  .refine((password) => /[A-Z]/.test(password), { message: 'Missing uppercase letter.' })
  .refine((password) => /[a-z]/.test(password), { message: 'Missing lowercase letter.' })
  .refine((password) => /[0-9]/.test(password), { message: 'Missing number.' });

export function validatePassword(password: string) {
  const errors: SubmissionErrors = {};

  const passwordResult = passwordSchema.safeParse(password);
  if (!passwordResult.success) {
    errors.password = [passwordResult.error.flatten().formErrors.join(' ')];
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export function validateEmailAndPassword(email: string, password: string): SubmissionErrors {
  const errors: SubmissionErrors = {};

  const emailResult = emailSchema.safeParse(email);
  if (!emailResult.success) {
    errors.email = [emailResult.error.flatten().formErrors.join(' ')];
  }

  const passwordResult = passwordSchema.safeParse(password);
  if (!passwordResult.success) {
    errors.password = [passwordResult.error.flatten().formErrors.join(' ')];
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
