import { z } from 'zod';

import { EventVisibilitySchema } from '~/routes/__types/event.ts';
import { slugValidator } from '~/routes/__types/validators.ts';

export const EventGeneralSettingsSchema = z.object({
  name: z.string().trim().min(3).max(50),
  visibility: EventVisibilitySchema,
  slug: slugValidator,
});
