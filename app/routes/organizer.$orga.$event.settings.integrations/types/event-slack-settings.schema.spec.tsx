import { withZod } from '@remix-validated-form/with-zod';
import { EventSlackSettingsSchema } from './event-slack-settings.schema';

describe('Validate EventSlackSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('slackWebhookUrl', 'https://webhook.com');

    const result = await withZod(EventSlackSettingsSchema).validate(formData);
    expect(result.data).toEqual({ slackWebhookUrl: 'https://webhook.com' });
  });

  it('returns validation errors', async () => {
    const formData = new FormData();
    formData.append('slackWebhookUrl', 'foo');

    const result = await withZod(EventSlackSettingsSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      slackWebhookUrl: 'Invalid url',
    });
  });
});
