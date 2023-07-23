import { z } from 'zod';

import { EventVisibilitySchema } from '~/routes/__types/event';
import { text } from '~/routes/__types/utils';
import { slugValidator } from '~/routes/__types/validators';

export const EventGeneralSettingsSchema = z.object({
  name: text(z.string().trim().min(3).max(50)),
  visibility: text(EventVisibilitySchema),
  slug: text(slugValidator),
});
