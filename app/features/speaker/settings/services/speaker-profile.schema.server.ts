import { z } from 'zod';
import type { EmailSchema } from '~/shared/validators/auth.ts';

const SocialLinksSchema = z.preprocess(
  (val) => (Array.isArray(val) ? val.filter(Boolean) : val),
  z.array(z.url().max(100)).default([]),
);

export const ProfileSchema = z.object({
  name: z.string().trim().min(1),
  picture: z.url().trim().nullable().default(null),
  bio: z.string().trim().nullable().default(null),
  references: z.string().trim().nullable().default(null),
  company: z.string().trim().nullable().default(null),
  location: z.string().trim().nullable().default(null),
  socialLinks: SocialLinksSchema,
});

export const FunnelSpeakerSchema = z.object({
  bio: z.string().trim().nullable().default(null),
});

export const UnlinkProviderSchema = z.object({
  newEmail: z.string().nullable().default(null),
});

export type ProfileData =
  | z.infer<typeof EmailSchema>
  | z.infer<typeof ProfileSchema>
  | z.infer<typeof FunnelSpeakerSchema>;
