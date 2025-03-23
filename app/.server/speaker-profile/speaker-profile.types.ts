import { type ZodSchema, z } from 'zod';

const SocialLinksSchema = makeFilteredArraySchema(z.string().url().max(100));

// TODO: see to factorize with validators/auth.ts
export const EmailSchema = z.object({
  email: z.string().email().trim().min(1),
});

// TODO: see to factorize with validators/auth.ts
export const EmailPasswordSchema = z.object({
  email: z.string().email().trim().min(1),
  password: z
    .string()
    .min(8, { message: 'Minimum 8 characters.' })
    .refine((password) => /[A-Z]/.test(password), { message: 'Missing uppercase letter.' })
    .refine((password) => /[a-z]/.test(password), { message: 'Missing lowercase letter.' })
    .refine((password) => /[0-9]/.test(password), { message: 'Missing number.' }),
});

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
  references: z.string().trim().nullable().default(null),
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
