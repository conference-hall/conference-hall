import { SlugSchema } from '@conference-hall/shared/validators/slug.ts';
import { z } from 'zod';
import { parseToUtcEndOfDay, parseToUtcStartOfDay } from '~/shared/datetimes/timezone.ts';

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
    onlineEvent: z.boolean().default(false),
    description: z.string().trim().min(1).nullable().default(null),
    conferenceStart: z.string().nullable().default(null),
    conferenceEnd: z.string().nullable().default(null),
    websiteUrl: z.url().trim().nullable().default(null),
    contactEmail: z.email().trim().nullable().default(null),
  })
  .transform(({ conferenceStart, conferenceEnd, timezone, ...rest }) => ({
    ...rest,
    timezone,
    conferenceStart: conferenceStart ? parseToUtcStartOfDay(conferenceStart, timezone) : null,
    conferenceEnd: conferenceEnd ? parseToUtcEndOfDay(conferenceEnd, timezone) : null,
  }))
  .refine(
    ({ conferenceStart, conferenceEnd }) => {
      if (conferenceStart && !conferenceEnd) return false;
      if (conferenceEnd && !conferenceStart) return false;
      if (conferenceStart && conferenceEnd && conferenceStart > conferenceEnd) return false;
      return true;
    },
    { path: ['conferenceStart'], error: 'Conference start date must be after the conference end date.' },
  );

export const CfpPreferencesSchema = z.object({
  codeOfConductUrl: z.url().trim().nullable().default(null),
  maxProposals: z.number().min(1).nullable().default(null),
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
    cfpStart: cfpStart ? parseToUtcStartOfDay(cfpStart, timezone) : null,
    cfpEnd: cfpEnd ? parseToUtcEndOfDay(cfpEnd, timezone) : null,
  }))
  .refine(
    ({ cfpStart, cfpEnd }) => {
      if (cfpStart && !cfpEnd) return false;
      if (cfpEnd && !cfpStart) return false;
      if (cfpStart && cfpEnd && cfpStart > cfpEnd) return false;
      return true;
    },
    { path: ['cfpStart'], error: 'Call for papers start date must be after the end date.' },
  );

export const EventEmailNotificationsSettingsSchema = z.object({
  emailOrganizer: z.email().nullable().default(null),
});

export const EventNotificationsSettingsSchema = z.object({
  emailNotifications: z.array(z.string()),
});

export const EventSlackSettingsSchema = z.object({
  slackWebhookUrl: z.url().nullable().default(null),
});
