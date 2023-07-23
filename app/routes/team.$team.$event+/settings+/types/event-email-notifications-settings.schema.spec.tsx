import { parse } from '@conform-to/zod';

import { EventEmailNotificationsSettingsSchema } from './event-email-notifications-settings.schema';

describe('Validate EventEmailNotificationsSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const form = new FormData();
    form.append('emailOrganizer', 'team@email.com');

    const result = parse(form, { schema: EventEmailNotificationsSettingsSchema });
    expect(result.value).toEqual({ emailOrganizer: 'team@email.com' });
  });

  it('returns validation errors', async () => {
    const form = new FormData();
    form.append('emailOrganizer', 'foo');

    const result = parse(form, { schema: EventEmailNotificationsSettingsSchema });
    expect(result.error).toEqual({
      emailOrganizer: 'Invalid email',
    });
  });
});
