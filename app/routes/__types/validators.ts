import { z } from 'zod';

export const slugValidator = z
  .string()
  .regex(/^[a-z0-9\\-]*$/, { message: 'Must only contain lower case alphanumeric and dashes (-).' })
  .trim()
  .min(3)
  .max(50);
