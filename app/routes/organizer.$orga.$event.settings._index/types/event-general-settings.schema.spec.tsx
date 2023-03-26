import { withZod } from '@remix-validated-form/with-zod';
import { EventGeneralSettingsSchema } from './event-general-settings.schema';

describe('Validate EventGeneralSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('name', 'Event name');
    formData.append('visibility', 'PUBLIC');
    formData.append('slug', 'event-name');

    const result = await withZod(EventGeneralSettingsSchema).validate(formData);
    expect(result.data).toEqual({
      name: 'Event name',
      slug: 'event-name',
      visibility: 'PUBLIC',
    });
  });

  it('returns validation errors', async () => {
    const formData = new FormData();
    formData.append('name', '');
    formData.append('visibility', 'toto');
    formData.append('slug', '!@#');

    const result = await withZod(EventGeneralSettingsSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      name: 'Required',
      slug: 'Must only contain lower case alphanumeric and dashes (-).',
      visibility: "Invalid enum value. Expected 'PUBLIC' | 'PRIVATE', received 'toto'",
    });
  });
});
