import { type ZodSchema, z } from 'zod';

export const PersonalInfoSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email().trim().min(1),
  picture: z.string().url().trim().nullable().default(null),
});

export const DetailsSchema = z.object({
  bio: z.string().trim().nullable().default(null),
  references: z.string().trim().nullable().default(null),
});

export const SocialLinksSchema = makeFilteredArraySchema(z.string().url());

export const AdditionalInfoSchema = z.object({
  company: z.string().trim().nullable().default(null),
  location: z.string().trim().nullable().default(null),
  socialLinks: SocialLinksSchema.default([]),
});

export type ProfileData =
  | z.infer<typeof PersonalInfoSchema>
  | z.infer<typeof DetailsSchema>
  | z.infer<typeof AdditionalInfoSchema>;

export type SocialLinks = z.infer<typeof SocialLinksSchema>;

function makeFilteredArraySchema<T extends ZodSchema>(schema: T) {
  return z
    .array(schema.nullable().default(null))
    .transform((items) => items?.filter((item): item is z.infer<T> => schema.safeParse(item).success));
}
