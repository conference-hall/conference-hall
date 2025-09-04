import { z } from 'zod';
import type { EmailSchema } from '~/shared/validators/auth.ts';
import type { SurveyDetailedAnswer } from './survey.types.ts';

export enum SpeakerProposalStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  DeliberationPending = 'DeliberationPending',
  AcceptedByOrganizers = 'AcceptedByOrganizers',
  RejectedByOrganizers = 'RejectedByOrganizers',
  ConfirmedBySpeaker = 'ConfirmedBySpeaker',
  DeclinedBySpeaker = 'DeclinedBySpeaker',
}

export type SocialLinks = Array<string>;

export type SpeakerData = {
  id: string;
  name: string;
  email?: string;
  picture?: string | null;
  company?: string | null;
  bio?: string | null;
  references?: string | null;
  location?: string | null;
  socialLinks?: SocialLinks;
  survey?: Array<SurveyDetailedAnswer>;
};

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

export const SpeakerCreationSchema = ProfileSchema.extend({
  email: z.email().trim().min(1),
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

export type SpeakerCreationData = z.infer<typeof SpeakerCreationSchema>;
