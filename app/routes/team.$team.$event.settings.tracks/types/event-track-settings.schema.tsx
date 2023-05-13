import { z } from 'zod';

import { text } from '~/schemas/utils';
import { checkboxValidator } from '~/schemas/validators';

export const EventTracksSettingsSchema = z.object({
  formatsRequired: text(checkboxValidator),
  categoriesRequired: text(checkboxValidator),
});
