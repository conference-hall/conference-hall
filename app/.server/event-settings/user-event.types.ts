import { z } from 'zod';

import { parseToUtcEndOfDay, parseToUtcStartOfDay } from '~/libs/datetimes/timezone.ts';
import { SlugSchema } from '~/libs/validators/slug.ts';

export const EventGeneralSettingsSchema = z.object({
  name: z.string().trim().min(3).max(50),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  slug: SlugSchema,
  timezone: z.string(),
});

export const EventDetailsSettingsSchema = z
  .object({
    timezone: z.string(),
    location: z.string().trim().nullable().default(null),
    description: z.string().trim().min(1).nullable().default(null),
    conferenceStart: z.string().nullable().default(null),
    conferenceEnd: z.string().nullable().default(null),
    websiteUrl: z.string().url().trim().nullable().default(null),
    contactEmail: z.string().email().trim().nullable().default(null),
  })
  .transform(({ conferenceStart, conferenceEnd, timezone, ...rest }) => ({
    ...rest,
    timezone,
    conferenceStart: conferenceStart ? parseToUtcStartOfDay(conferenceStart, timezone, 'yyyy-MM-dd') : null,
    conferenceEnd: conferenceEnd ? parseToUtcEndOfDay(conferenceEnd, timezone, 'yyyy-MM-dd') : null,
  }))
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
    timezone: z.string(),
    cfpStart: z.string().nullable().default(null),
    cfpEnd: z.string().nullable().default(null),
  })
  .transform(({ cfpStart, cfpEnd, timezone, ...rest }) => ({
    ...rest,
    timezone,
    cfpStart: cfpStart ? parseToUtcStartOfDay(cfpStart, timezone, 'yyyy-MM-dd') : null,
    cfpEnd: cfpEnd ? parseToUtcEndOfDay(cfpEnd, timezone, 'yyyy-MM-dd') : null,
  }))
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
