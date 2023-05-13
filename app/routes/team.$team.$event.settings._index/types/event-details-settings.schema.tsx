import { z } from 'zod';

import { text } from '~/schemas/utils';
import { dateValidator } from '~/schemas/validators';

export const EventDetailsSettingsSchema = z
  .object({
    address: text(z.string().trim().nullable().default(null)),
    description: text(z.string().trim().min(1).nullable().default(null)),
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
