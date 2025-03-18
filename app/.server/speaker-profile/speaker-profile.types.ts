import { type ZodSchema, z } from 'zod';

const SocialLinksSchema = makeFilteredArraySchema(z.string().url().max(100));

export const AccountInfoSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email().trim().min(1),
  picture: z.string().url().trim().nullable().default(null),
});

export const ProfileSchema = z.object({
  bio: z.string().trim().nullable().default(null),
  references: z.string().trim().nullable().default(null),
  company: z.string().trim().nullable().default(null),
  location: z.string().trim().nullable().default(null),
  socialLinks: SocialLinksSchema.default([]),
});

export type ProfileData = z.infer<typeof AccountInfoSchema> | z.infer<typeof ProfileSchema>;

export type SocialLinks = z.infer<typeof SocialLinksSchema>;

function makeFilteredArraySchema<T extends ZodSchema>(schema: T) {
  return z
    .array(schema.nullable().default(null))
    .transform((items) => items?.filter((item): item is z.infer<T> => schema.safeParse(item).success));
}
