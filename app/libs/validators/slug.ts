import { z } from 'zod';

export const SlugSchema = z
  .string()
  .regex(/^[a-z0-9\\-]*$/, { message: 'Must only contain lower case alphanumeric and dashes (-).' })
  .trim()
  .min(3)
  .max(50)
  .refine((slug) => !RESERVED_SLUGS.includes(slug), { message: 'This URL is reserved.' });

const RESERVED_SLUGS = [
  'new',
  'admin',
  'request',
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
