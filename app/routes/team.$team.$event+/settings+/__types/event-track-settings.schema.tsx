import { z } from 'zod';

import { text } from '~/routes/__types/utils';
import { checkboxValidator } from '~/routes/__types/validators';

export const EventTracksSettingsSchema = z.object({
  formatsRequired: text(checkboxValidator),
  categoriesRequired: text(checkboxValidator),
});
