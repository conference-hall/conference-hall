import { EventDetailsSettingsSchema } from './event-details-settings.schema';
import { parse } from '@conform-to/zod';

describe('Validate EventDetailsSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const form = new FormData();
    form.append('address', 'Nantes, France');
    form.append('description', 'This is a description');
    form.append('conferenceStart', '2022-01-01');
    form.append('conferenceEnd', '2022-01-02');
    form.append('websiteUrl', 'https://website.com');
    form.append('contactEmail', 'contact@email.com');

    const result = parse(form, { schema: EventDetailsSettingsSchema });
    expect(result.value).toEqual({
      address: 'Nantes, France',
      description: 'This is a description',
      conferenceStart: new Date('2022-01-01'),
      conferenceEnd: new Date('2022-01-02'),
      websiteUrl: 'https://website.com',
      contactEmail: 'contact@email.com',
    });
  });

  it('resets data', async () => {
    const form = new FormData();
    form.append('address', '');
    form.append('description', '');
    form.append('conferenceStart', '');
    form.append('conferenceEnd', '');
    form.append('websiteUrl', '');
    form.append('contactEmail', '');

    const result = parse(form, { schema: EventDetailsSettingsSchema });
    expect(result.value).toEqual({
      address: null,
      description: null,
      conferenceStart: null,
      conferenceEnd: null,
      websiteUrl: null,
      contactEmail: null,
    });
  });

  it('returns validation errors', async () => {
    const form = new FormData();
    form.append('conferenceStart', 'foo');
    form.append('conferenceEnd', 'foo');
    form.append('websiteUrl', 'foo');
    form.append('contactEmail', 'foo');

    const result = parse(form, { schema: EventDetailsSettingsSchema });
    expect(result.error).toEqual({
      conferenceEnd: 'Invalid date',
      conferenceStart: 'Invalid date',
      contactEmail: 'Invalid email',
      websiteUrl: 'Invalid url',
    });
  });

  it('returns errors if dates are not a valid range', async () => {
    const form = new FormData();
    form.append('conferenceStart', '2022-01-02');
    form.append('conferenceEnd', '2022-01-01');

    const result = parse(form, { schema: EventDetailsSettingsSchema });
    expect(result.error).toEqual({
      conferenceStart: 'Conference start date must be after the conference end date.',
    });
  });

  it('returns errors if start date missing', async () => {
    const form = new FormData();
    form.append('conferenceEnd', '2022-01-01');

    const result = parse(form, { schema: EventDetailsSettingsSchema });
    expect(result.error).toEqual({
      conferenceStart: 'Conference start date must be after the conference end date.',
    });
  });

  it('returns errors if end date missing', async () => {
    const form = new FormData();
    form.append('conferenceStart', '2022-01-01');

    const result = parse(form, { schema: EventDetailsSettingsSchema });
    expect(result.error).toEqual({
      conferenceStart: 'Conference start date must be after the conference end date.',
    });
  });
});
