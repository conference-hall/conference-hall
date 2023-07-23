import { z } from 'zod';

import { numeric, text } from '~/routes/__types/utils';
import { dateValidator } from '~/routes/__types/validators';

export const CfpPreferencesSchema = z.object({
  codeOfConductUrl: text(z.string().url().trim().nullable().default(null)),
  maxProposals: numeric(z.number().nullable().default(null)),
});

export const CfpMeetupOpeningSchema = z.object({
  cfpStart: text(dateValidator),
});

export const CfpConferenceOpeningSchema = z
  .object({
    cfpStart: text(dateValidator),
    cfpEnd: text(dateValidator),
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
