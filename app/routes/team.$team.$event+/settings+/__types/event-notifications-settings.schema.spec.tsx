import { parse } from '@conform-to/zod';
import { describe, expect, it } from 'vitest';

import { EventNotificationsSettingsSchema } from './event-notifications-settings.schema';

describe('Validate EventNotificationsSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const form = new FormData();
    form.append('emailNotifications', 'Notif 1');
    form.append('emailNotifications', 'Notif 2');

    const result = parse(form, { schema: EventNotificationsSettingsSchema });
    expect(result.value).toEqual({ emailNotifications: ['Notif 1', 'Notif 2'] });
  });
});
