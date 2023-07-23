import { z } from 'zod';

import { EventVisibilitySchema } from '~/schemas/event';
import { text } from '~/schemas/utils';
import { slugValidator } from '~/schemas/validators';

export const EventGeneralSettingsSchema = z.object({
  name: text(z.string().trim().min(3).max(50)),
  visibility: text(EventVisibilitySchema),
  slug: text(slugValidator),
});
