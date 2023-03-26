import { withZod } from '@remix-validated-form/with-zod';
import { EventEmailNotificationsSettingsSchema } from './event-email-notifications-settings.schema';

describe('Validate EventEmailNotificationsSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('emailOrganizer', 'orga@email.com');

    const result = await withZod(EventEmailNotificationsSettingsSchema).validate(formData);
    expect(result.data).toEqual({ emailOrganizer: 'orga@email.com' });
  });

  it('returns validation errors', async () => {
    const formData = new FormData();
    formData.append('emailOrganizer', 'foo');

    const result = await withZod(EventEmailNotificationsSettingsSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      emailOrganizer: 'Invalid email',
    });
  });
});
