import { EventSlackSettingsSchema } from './event-slack-settings.schema';
import { parse } from '@conform-to/zod';

describe('Validate EventSlackSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const form = new FormData();
    form.append('slackWebhookUrl', 'https://webhook.com');

    const result = parse(form, { schema: EventSlackSettingsSchema });
    expect(result.value).toEqual({ slackWebhookUrl: 'https://webhook.com' });
  });

  it('returns validation errors', async () => {
    const form = new FormData();
    form.append('slackWebhookUrl', 'foo');

    const result = parse(form, { schema: EventSlackSettingsSchema });
    expect(result.error).toEqual({
      slackWebhookUrl: 'Invalid url',
    });
  });
});
