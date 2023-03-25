import { withZod } from '@remix-validated-form/with-zod';
import { EventTracksSettingsSchema } from './event-track-settings.schema';

describe('Validate EventTracksSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('formatsRequired', 'true');
    formData.append('categoriesRequired', 'false');

    const result = await withZod(EventTracksSettingsSchema).validate(formData);
    expect(result.data).toEqual({ formatsRequired: true, categoriesRequired: false });
  });

  it('returns falsy values on other values', async () => {
    const formData = new FormData();
    formData.append('formatsRequired', 'foo');
    formData.append('categoriesRequired', 'foo');

    const result = await withZod(EventTracksSettingsSchema).validate(formData);
    expect(result.data).toEqual({ formatsRequired: false, categoriesRequired: false });
  });
});
