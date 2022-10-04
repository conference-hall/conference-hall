import { z } from 'zod';

export const PersonalInfoSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email().trim().min(1),
  photoURL: z.string().url().trim().min(1),
});

export const DetailsSchema = z.object({
  bio: z.string().trim().nullable(),
  references: z.string().trim().nullable(),
});

export const AdditionalInfoSchema = z.object({
  company: z.string().trim(),
  address: z.string().trim(),
  twitter: z.string().trim(),
  github: z.string().trim(),
});

type ProfileSchema = typeof PersonalInfoSchema | typeof DetailsSchema | typeof AdditionalInfoSchema;

export type ProfileUpdateData = z.infer<ProfileSchema>;
