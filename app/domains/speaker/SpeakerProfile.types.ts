import { z } from 'zod';

export const PersonalInfoSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email().trim().min(1),
  picture: z.string().url().trim().nullable().default(null),
});

export const DetailsSchema = z.object({
  bio: z.string().trim().nullable().default(null),
  references: z.string().trim().nullable().default(null),
});

export const SocialLinksSchema = z.object({
  twitter: z.string().trim().nullable().default(null),
  github: z.string().trim().nullable().default(null),
});

export const AdditionalInfoSchema = z
  .object({
    company: z.string().trim().nullable().default(null),
    address: z.string().trim().nullable().default(null),
  })
  .merge(SocialLinksSchema)
  .transform(({ company, address, twitter, github }) => ({
    company,
    address,
    socials: { github, twitter },
  }));

export type ProfileData =
  | z.infer<typeof PersonalInfoSchema>
  | z.infer<typeof DetailsSchema>
  | z.infer<typeof AdditionalInfoSchema>;

export type SocialLinks = z.infer<typeof SocialLinksSchema>;
