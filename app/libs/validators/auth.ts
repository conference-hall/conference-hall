import { z } from 'zod';
import type { SubmissionErrors } from '~/types/errors.types.ts';

const _emailSchema = z.string().email({ message: 'Invalid email address.' }).trim().min(1);

const _passwordSchema = z
  .string()
  .min(8, { message: 'Minimum 8 characters.' })
  .refine((password) => /[A-Z]/.test(password), { message: 'Missing uppercase letter.' })
  .refine((password) => /[a-z]/.test(password), { message: 'Missing lowercase letter.' })
  .refine((password) => /[0-9]/.test(password), { message: 'Missing number.' });

export const EmailSchema = z.object({
  email: _emailSchema,
});

export const EmailPasswordSchema = z.object({
  email: _emailSchema,
  password: _passwordSchema,
});

export function validatePassword(password: string) {
  const errors: SubmissionErrors = {};

  const passwordResult = _passwordSchema.safeParse(password);
  if (!passwordResult.success) {
    errors.password = [passwordResult.error.flatten().formErrors.join(' ')];
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export function validateEmailAndPassword(email: string, password: string): SubmissionErrors {
  const errors: SubmissionErrors = {};

  const emailResult = _emailSchema.safeParse(email);
  if (!emailResult.success) {
    errors.email = [emailResult.error.flatten().formErrors.join(' ')];
  }

  const passwordResult = _passwordSchema.safeParse(password);
  if (!passwordResult.success) {
    errors.password = [passwordResult.error.flatten().formErrors.join(' ')];
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
