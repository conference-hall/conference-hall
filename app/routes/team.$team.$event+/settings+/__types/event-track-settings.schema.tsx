import { z } from 'zod';

import { checkboxValidator } from '~/routes/__types/validators';

export const EventTracksSettingsSchema = z.object({
  formatsRequired: checkboxValidator,
  categoriesRequired: checkboxValidator,
});
