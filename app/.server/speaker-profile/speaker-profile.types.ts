import { type ZodSchema, z } from 'zod';
import type { EmailSchema } from '~/shared/validators/auth.ts';

const SocialLinksSchema = makeFilteredArraySchema(z.string().url().max(100));

export const ProfileSchema = z.object({
  name: z.string().trim().min(1),
  picture: z.string().url().trim().nullable().default(null),
  bio: z.string().trim().nullable().default(null),
  references: z.string().trim().nullable().default(null),
  company: z.string().trim().nullable().default(null),
  location: z.string().trim().nullable().default(null),
  socialLinks: SocialLinksSchema.default([]),
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

export type SocialLinks = z.infer<typeof SocialLinksSchema>;

function makeFilteredArraySchema<T extends ZodSchema>(schema: T) {
  return z
    .array(schema.nullable().default(null))
    .transform((items) => items?.filter((item): item is z.infer<T> => schema.safeParse(item).success));
}
