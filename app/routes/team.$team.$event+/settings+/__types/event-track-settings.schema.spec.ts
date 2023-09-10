import { parse } from '@conform-to/zod';

import { EventTracksSettingsSchema } from './event-track-settings.schema';

describe('Validate EventTracksSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const form = new FormData();
    form.append('formatsRequired', 'true');
    form.append('categoriesRequired', 'false');

    const result = parse(form, { schema: EventTracksSettingsSchema });
    expect(result.value).toEqual({ formatsRequired: true, categoriesRequired: false });
  });

  it('returns falsy values on other values', async () => {
    const form = new FormData();
    form.append('formatsRequired', 'foo');
    form.append('categoriesRequired', 'foo');

    const result = parse(form, { schema: EventTracksSettingsSchema });
    expect(result.value).toEqual({ formatsRequired: false, categoriesRequired: false });
  });
});
