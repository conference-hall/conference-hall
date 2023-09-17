import { z } from 'zod';

import { EventTypeSchema, EventVisibilitySchema } from '~/routes/__types/event.ts';
import { slugValidator } from '~/routes/__types/validators.ts';

export const EventCreateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  visibility: EventVisibilitySchema,
  slug: slugValidator,
  type: EventTypeSchema,
});

export type EventCreateData = z.infer<typeof EventCreateSchema>;
