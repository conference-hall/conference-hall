import { z } from 'zod';

import { EventTypeSchema, EventVisibilitySchema } from '~/routes/__types/event';
import { text } from '~/routes/__types/utils';
import { slugValidator } from '~/routes/__types/validators';

export const EventCreateSchema = z.object({
  name: text(z.string().trim().min(3).max(50)),
  visibility: text(EventVisibilitySchema),
  slug: text(slugValidator),
  type: text(EventTypeSchema),
});

export type EventCreateData = z.infer<typeof EventCreateSchema>;
