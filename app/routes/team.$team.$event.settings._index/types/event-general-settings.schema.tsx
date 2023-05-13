import { z } from 'zod';
import { text } from '~/schemas/utils';
import { EventVisibilitySchema } from '~/schemas/event';
import { slugValidator } from '~/schemas/validators';

export const EventGeneralSettingsSchema = z.object({
  name: text(z.string().trim().min(3).max(50)),
  visibility: text(EventVisibilitySchema),
  slug: text(slugValidator),
});
