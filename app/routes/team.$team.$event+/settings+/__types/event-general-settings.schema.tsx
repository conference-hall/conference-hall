import { z } from 'zod';

import { EventVisibilitySchema } from '~/routes/__types/event';
import { slugValidator } from '~/routes/__types/validators';

export const EventGeneralSettingsSchema = z.object({
  name: z.string().trim().min(3).max(50),
  visibility: EventVisibilitySchema,
  slug: slugValidator,
});
