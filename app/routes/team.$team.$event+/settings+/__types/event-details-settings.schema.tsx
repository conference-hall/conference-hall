import { z } from 'zod';

export const EventDetailsSettingsSchema = z
  .object({
    address: z.string().trim().nullable().default(null),
    description: z.string().trim().nullable().default(null),
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
