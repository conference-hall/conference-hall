import { withZod } from '@remix-validated-form/with-zod';
import { EventNotificationsSettingsSchema } from './event-notifications-settings.schema';

describe('Validate EventNotificationsSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('emailNotifications', 'Notif 1');
    formData.append('emailNotifications', 'Notif 2');

    const result = await withZod(EventNotificationsSettingsSchema).validate(formData);
    expect(result.data).toEqual({ emailNotifications: ['Notif 1', 'Notif 2'] });
  });
});
