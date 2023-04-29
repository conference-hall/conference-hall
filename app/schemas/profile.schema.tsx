import { z } from 'zod';
import { text } from 'zod-form-data';

export const PersonalInfoSchema = z.object({
  name: text(z.string().trim().min(1)),
  email: text(z.string().email().trim().min(1)),
  picture: text(z.string().url().trim().nullable().default(null)),
});

export const DetailsSchema = z.object({
  bio: text(z.string().trim().nullable().default(null)),
  references: text(z.string().trim().nullable().default(null)),
});

export const AdditionalInfoSchema = z.object({
  company: text(z.string().trim().nullable().default(null)),
  address: text(z.string().trim().nullable().default(null)),
  twitter: text(z.string().trim().nullable().default(null)),
  github: text(z.string().trim().nullable().default(null)),
});

type ProfileSchema = typeof PersonalInfoSchema | typeof DetailsSchema | typeof AdditionalInfoSchema;

export type ProfileUpdateData = z.infer<ProfileSchema>;
