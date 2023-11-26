import { z } from 'zod';

import { EventVisibilitySchema } from '~/domains/shared/Event.types';
import { slugValidator } from '~/libs/validators/slug';

export const EventGeneralSettingsSchema = z.object({
  name: z.string().trim().min(3).max(50),
  visibility: EventVisibilitySchema,
  slug: slugValidator,
});

export const EventDetailsSettingsSchema = z
  .object({
    address: z.string().trim().nullable().default(null),
    description: z.string().trim().min(1).nullable().default(null),
    conferenceStart: z.coerce.date().nullable().default(null),
    conferenceEnd: z.coerce.date().nullable().default(null),
    websiteUrl: z.string().url().trim().nullable().default(null),
    contactEmail: z.string().email().trim().nullable().default(null),
  })
  .refine(
    ({ conferenceStart, conferenceEnd }) => {
      if (conferenceStart && !conferenceEnd) return false;
      if (conferenceEnd && !conferenceStart) return false;
      if (conferenceStart && conferenceEnd && conferenceStart > conferenceEnd) return false;
      return true;
    },
    { path: ['conferenceStart'], message: 'Conference start date must be after the conference end date.' },
  );

export const CfpPreferencesSchema = z.object({
  codeOfConductUrl: z.string().url().trim().nullable().default(null),
  maxProposals: z.number().nullable().default(null),
});

export const CfpMeetupOpeningSchema = z.object({
  cfpStart: z.coerce.date().nullable().default(null),
});

export const CfpConferenceOpeningSchema = z
  .object({
    cfpStart: z.coerce.date().nullable().default(null),
    cfpEnd: z.coerce.date().nullable().default(null),
  })
  .refine(
    ({ cfpStart, cfpEnd }) => {
      if (cfpStart && !cfpEnd) return false;
      if (cfpEnd && !cfpStart) return false;
      if (cfpStart && cfpEnd && cfpStart > cfpEnd) return false;
      return true;
    },
    { path: ['cfpStart'], message: 'Call for paper start date must be after the end date.' },
  );

export const EventSurveySettingsSchema = z.object({
  surveyQuestions: z.array(z.string()),
});

export const EventEmailNotificationsSettingsSchema = z.object({
  emailOrganizer: z.string().email().nullable().default(null),
});

export const EventNotificationsSettingsSchema = z.object({
  emailNotifications: z.array(z.string()),
});

export const EventSlackSettingsSchema = z.object({
  slackWebhookUrl: z.string().url().nullable().default(null),
});
