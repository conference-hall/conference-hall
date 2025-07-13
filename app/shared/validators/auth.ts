import { z } from 'zod/v4';
import type { SubmissionErrors } from '~/shared/types/errors.types.ts';

const _emailSchema = z.email({ error: 'Invalid email address.' }).trim().min(1);

const _passwordSchema = z
  .string()
  .min(8, { error: 'Minimum 8 characters.' })
  .refine((password) => /[A-Z]/.test(password), { error: 'Missing uppercase letter.' })
  .refine((password) => /[a-z]/.test(password), { error: 'Missing lowercase letter.' })
  .refine((password) => /[0-9]/.test(password), { error: 'Missing number.' });

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
    errors.password = [z.flattenError(passwordResult.error).formErrors.join(' ')];
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export function validateEmailAndPassword(email: string, password: string): SubmissionErrors {
  const errors: SubmissionErrors = {};

  const emailResult = _emailSchema.safeParse(email);
  if (!emailResult.success) {
    errors.email = [z.flattenError(emailResult.error).formErrors.join(' ')];
  }

  const passwordResult = _passwordSchema.safeParse(password);
  if (!passwordResult.success) {
    errors.password = [z.flattenError(passwordResult.error).formErrors.join(' ')];
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
