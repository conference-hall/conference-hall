import { z } from 'zod';
import { checkbox, numeric, repeatable, text } from 'zod-form-data';
import { checkboxValidator, dateValidator, slugValidator } from '~/schemas/validators';

export const EventTypeSchema = z.enum(['CONFERENCE', 'MEETUP']);
export const EventVisibilitySchema = z.enum(['PUBLIC', 'PRIVATE']);

export const EventCreateSchema = z.object({
  type: text(EventTypeSchema),
  name: text(z.string().trim().min(3).max(50)),
  visibility: text(EventVisibilitySchema),
  slug: text(slugValidator),
});

export const EventGeneralSettingsSchema = z.object({
  name: text(z.string().trim().min(3).max(50)),
  visibility: text(EventVisibilitySchema),
  slug: text(slugValidator),
});

export const EventDetailsSettingsSchema = z
  .object({
    address: text(z.string().trim().nullable().default(null)),
    description: text(z.string().trim().min(1).optional()),
    conferenceStart: text(dateValidator),
    conferenceEnd: text(dateValidator),
    websiteUrl: text(z.string().url().trim().nullable().default(null)),
    contactEmail: text(z.string().email().trim().nullable().default(null)),
  })
  .refine(
    ({ conferenceStart, conferenceEnd }) => {
      if (conferenceStart && !conferenceEnd) return false;
      if (conferenceEnd && !conferenceStart) return false;
      if (conferenceStart && conferenceEnd && conferenceStart > conferenceEnd) return false;
      return true;
    },
    { path: ['conferenceStart'], message: 'Conference start date must be after the conference end date.' }
  );

export const EventTracksSettingsSchema = z.object({
  formatsRequired: text(checkboxValidator),
  categoriesRequired: text(checkboxValidator),
});

export const EventCfpSettingsSchema = z
  .object({
    type: text(EventTypeSchema),
    cfpStart: text(dateValidator),
    cfpEnd: text(dateValidator),
    codeOfConductUrl: text(z.string().url().trim().nullable().default(null)),
    maxProposals: numeric(z.number().nullable().default(null)),
  })
  .refine(
    ({ type, cfpStart, cfpEnd }) => {
      if (type === 'MEETUP') return true;
      if (cfpStart && !cfpEnd) return false;
      if (cfpEnd && !cfpStart) return false;
      if (cfpStart && cfpEnd && cfpStart > cfpEnd) return false;
      return true;
    },
    { path: ['cfpStart'], message: 'Call for paper start date must be after the end date.' }
  );

export const EventSurveySettingsSchema = z.object({
  surveyQuestions: repeatable(z.array(z.string())),
});

export const EventReviewSettingsSchema = z.object({
  displayOrganizersRatings: checkbox(),
  displayProposalsRatings: checkbox(),
  displayProposalsSpeakers: checkbox(),
});

export const EventNotificationsSettingsSchema = z.object({
  emailNotifications: repeatable(z.array(z.string())),
});

export const EventSlackSettingsSchema = z.object({
  slackWebhookUrl: text(z.string().url().nullable().default(null)),
});

export const EventTrackSaveSchema = z.object({
  id: text(z.string().trim().optional()),
  name: text(z.string().trim().min(1)),
  description: text(z.string().trim().nullable().default(null)),
});

export type EventCreateData = z.infer<typeof EventCreateSchema>;
export type EventTrackSaveData = z.infer<typeof EventTrackSaveSchema>;
