import { z } from 'zod';
import type { AutofillRules } from '../models/autofill.ts';

// An unchecked box means an empty scope, never "all": absence is not a missing filter here.
export const AutofillScopeSchema = z
  .object({
    days: z.array(z.string()).default([]),
    trackIds: z.array(z.string()).default([]),
    proposalState: z.enum(['all', 'accepted', 'confirmed']).default('accepted'),
    reset: z.boolean().default(false),
    formatDuration: z.boolean().default(false),
    speakerRest: z.enum(['15', '30', '60', '120']).optional(),
  })
  .transform(({ formatDuration, speakerRest, ...scope }) => ({
    ...scope,
    rules: { formatDuration, speakerRest: speakerRest ? (Number(speakerRest) as AutofillRules['speakerRest']) : null },
  }));
