import { z } from 'zod';
import { EventTypeSchema, EventVisibilitySchema } from '~/schemas/event';
import { text } from '~/schemas/utils';
import { slugValidator } from '~/schemas/validators';

export const EventCreateSchema = z.object({
  name: text(z.string().trim().min(3).max(50)),
  visibility: text(EventVisibilitySchema),
  slug: text(slugValidator),
  type: text(EventTypeSchema),
});

export type EventCreateData = z.infer<typeof EventCreateSchema>;
