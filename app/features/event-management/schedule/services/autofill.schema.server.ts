import { z } from 'zod';

// An unchecked box means an empty scope, never "all": absence is not a missing filter here.
export const AutofillScopeSchema = z.object({
  days: z.array(z.string()).default([]),
  trackIds: z.array(z.string()).default([]),
  proposalState: z.enum(['all', 'accepted', 'confirmed']).default('accepted'),
  reset: z.boolean().default(false),
});
