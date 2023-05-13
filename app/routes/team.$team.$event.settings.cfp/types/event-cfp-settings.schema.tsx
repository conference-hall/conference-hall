import { z } from 'zod';
import { EventTypeSchema } from '~/schemas/event';
import { numeric, text } from '~/schemas/utils';
import { dateValidator } from '~/schemas/validators';

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
