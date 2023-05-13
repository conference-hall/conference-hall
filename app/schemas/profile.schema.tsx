import { z } from 'zod';
import { text } from './utils';

export const PersonalInfoSchema = z.object({
  name: text(z.string().trim().min(1)),
  email: text(z.string().email().trim().min(1)),
  picture: text(z.string().url().trim().nullable().default(null)),
});

export type PersonalInfoData = z.infer<typeof PersonalInfoSchema>;

export const DetailsSchema = z.object({
  bio: text(z.string().trim().nullable().default(null)),
  references: text(z.string().trim().nullable().default(null)),
});

export type DetailsData = z.infer<typeof DetailsSchema>;

export const AdditionalInfoSchema = z.object({
  company: text(z.string().trim().nullable().default(null)),
  address: text(z.string().trim().nullable().default(null)),
  twitter: text(z.string().trim().nullable().default(null)),
  github: text(z.string().trim().nullable().default(null)),
});

export type AdditionalInfoData = z.infer<typeof AdditionalInfoSchema>;

export type ProfileData = PersonalInfoData | DetailsData | AdditionalInfoData;
