import { z } from 'zod/v4';

export const SlugSchema = z
  .string()
  .regex(/^[a-z0-9-]*$/, { error: 'Must only contain lower case alphanumeric and dashes (-).' })
  .trim()
  .min(3)
  .max(50)
  .refine((slug) => !RESERVED_SLUGS.includes(slug), { error: 'This URL is reserved.' });

const RESERVED_SLUGS = [
  'new',
  'admin',
  'request',
  'locales',
  'api',
  'auth',
  'team',
  'teams',
  'user',
  'users',
  'event',
  'events',
  'settings',
  'speaker',
  'speakers',
  'profile',
  'account',
  'public',
  'assets',
  'invite',
  'docs',
  'notifications',
  'storage',
  'healthcheck',
];
