import { z } from 'zod';

export const PersonalInfoSchema = z.object({
  name: z.string().trim(),
  email: z.string().email().trim(),
  picture: z.string().url().trim().nullable().default(null),
});

export type PersonalInfoData = z.infer<typeof PersonalInfoSchema>;

export const DetailsSchema = z.object({
  bio: z.string().trim().nullable().default(null),
  references: z.string().trim().nullable().default(null),
});

export type DetailsData = z.infer<typeof DetailsSchema>;

export const AdditionalInfoSchema = z.object({
  company: z.string().trim().nullable().default(null),
  address: z.string().trim().nullable().default(null),
  twitter: z.string().trim().nullable().default(null),
  github: z.string().trim().nullable().default(null),
});

export type AdditionalInfoData = z.infer<typeof AdditionalInfoSchema>;

export type ProfileData = PersonalInfoData | DetailsData | AdditionalInfoData;
