import { z } from 'zod';
import { SPEAKER_REST_MINUTES } from '../models/autofill.ts';

// An unchecked box means an empty scope, never "all": absence is not a missing filter here.
export const AutofillScopeSchema = z
  .object({
    days: z.array(z.string()).default([]),
    trackIds: z.array(z.string()).default([]),
    proposalState: z.enum(['all', 'accepted', 'confirmed']).default('accepted'),
    reset: z.boolean().default(false),
    formatDuration: z.boolean().default(false),
    speakerRest: z.string().pipe(z.coerce.number()).pipe(z.literal(SPEAKER_REST_MINUTES)).optional(),
  })
  .transform(({ formatDuration, speakerRest, ...scope }) => ({
    ...scope,
    rules: { formatDuration, speakerRest: speakerRest ?? null },
  }));
