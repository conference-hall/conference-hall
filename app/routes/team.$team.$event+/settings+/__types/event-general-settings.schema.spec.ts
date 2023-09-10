import { parse } from '@conform-to/zod';

import { EventGeneralSettingsSchema } from './event-general-settings.schema';

describe('Validate EventGeneralSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const form = new FormData();
    form.append('name', 'Event name');
    form.append('visibility', 'PUBLIC');
    form.append('slug', 'event-name');

    const result = parse(form, { schema: EventGeneralSettingsSchema });
    expect(result.value).toEqual({
      name: 'Event name',
      slug: 'event-name',
      visibility: 'PUBLIC',
    });
  });

  it('returns validation errors', async () => {
    const form = new FormData();
    form.append('name', '');
    form.append('visibility', 'toto');
    form.append('slug', '!@#');

    const result = parse(form, { schema: EventGeneralSettingsSchema });
    expect(result.error).toEqual({
      name: ['Required'],
      slug: ['Must only contain lower case alphanumeric and dashes (-).'],
      visibility: ["Invalid enum value. Expected 'PUBLIC' | 'PRIVATE', received 'toto'"],
    });
  });
});
