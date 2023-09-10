import { z } from 'zod';

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
