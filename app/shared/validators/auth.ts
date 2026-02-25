import type { ParseKeys } from 'i18next';
import { z } from 'zod';
import type { I18nSubmissionErrors } from '~/shared/types/errors.types.ts';

const requiredEmailSchema = z.string().trim().min(1, { error: 'error.field.email.required' });

const requiredPasswordSchema = z.string().min(1, { error: 'error.field.password.required' });

const emailSchema = requiredEmailSchema.pipe(z.email({ error: 'error.field.email.invalid' }));

const passwordSchema = z
  .string()
  .min(8, { error: 'error.field.password.min-length' })
  .refine((password) => /[A-Z]/.test(password), { error: 'error.field.password.missing-uppercase' })
  .refine((password) => /[a-z]/.test(password), { error: 'error.field.password.missing-lowercase' })
  .refine((password) => /[0-9]/.test(password), { error: 'error.field.password.missing-number' });

const EmailPasswordSchema = z.object({ email: emailSchema, password: passwordSchema });

export function validatePassword(password: string): I18nSubmissionErrors {
  const result = z.object({ password: passwordSchema }).safeParse({ password });
  return result.success ? null : flattenErrors(result.error);
}

export function validateRequiredEmailAndPassword(email: string, password: string): I18nSubmissionErrors {
  const result = z
    .object({ email: requiredEmailSchema, password: requiredPasswordSchema })
    .safeParse({ email, password });
  return result.success ? null : flattenErrors(result.error);
}

export function validateEmailAndPassword(email: string, password: string): I18nSubmissionErrors {
  const result = EmailPasswordSchema.safeParse({ email, password });
  return result.success ? null : flattenErrors(result.error);
}

function flattenErrors(error: z.ZodError): I18nSubmissionErrors {
  const errors: I18nSubmissionErrors = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0]);
    (errors[field] ??= []).push(issue.message as ParseKeys);
  }
  return Object.keys(errors).length > 0 ? errors : null;
}
