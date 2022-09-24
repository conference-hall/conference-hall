import { z } from 'zod';

export type ValidationErrors = {
  formErrors: string[];
  fieldErrors: {
    [k: string]: string[];
  };
};

export const slugValidator = z
  .string()
  .regex(/^[a-z0-9\\-]*$/, { message: 'Must only contain lower case alphanumeric and dashes (-).' })
  .trim()
  .min(3)
  .max(50);

export const dateValidator = z.preprocess((d: any) => (d ? new Date(d) : null), z.date().nullable().default(null));

export const checkboxValidator = z.preprocess(
  (b) => (b === undefined ? undefined : b === 'true'),
  z.boolean().optional()
);
