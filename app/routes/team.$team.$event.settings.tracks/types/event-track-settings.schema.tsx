import { z } from 'zod';
import { text } from 'zod-form-data';
import { checkboxValidator } from '~/schemas/validators';

export const EventTracksSettingsSchema = z.object({
  formatsRequired: text(checkboxValidator),
  categoriesRequired: text(checkboxValidator),
});
