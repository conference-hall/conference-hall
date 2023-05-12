import { withZod } from '@remix-validated-form/with-zod';
import { EventDetailsSettingsSchema } from './event-details-settings.schema';

describe('Validate EventDetailsSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('address', 'Nantes, France');
    formData.append('description', 'This is a description');
    formData.append('conferenceStart', '2022-01-01');
    formData.append('conferenceEnd', '2022-01-02');
    formData.append('websiteUrl', 'https://website.com');
    formData.append('contactEmail', 'contact@email.com');

    const result = await withZod(EventDetailsSettingsSchema).validate(formData);
    expect(result.data).toEqual({
      address: 'Nantes, France',
      description: 'This is a description',
      conferenceStart: new Date('2022-01-01'),
      conferenceEnd: new Date('2022-01-02'),
      websiteUrl: 'https://website.com',
      contactEmail: 'contact@email.com',
    });
  });

  it('resets data', async () => {
    const formData = new FormData();
    formData.append('address', '');
    formData.append('description', '');
    formData.append('conferenceStart', '');
    formData.append('conferenceEnd', '');
    formData.append('websiteUrl', '');
    formData.append('contactEmail', '');

    const result = await withZod(EventDetailsSettingsSchema).validate(formData);
    expect(result.data).toEqual({
      address: null,
      description: null,
      conferenceStart: null,
      conferenceEnd: null,
      websiteUrl: null,
      contactEmail: null,
    });
  });

  it('returns validation errors', async () => {
    const formData = new FormData();
    formData.append('conferenceStart', 'foo');
    formData.append('conferenceEnd', 'foo');
    formData.append('websiteUrl', 'foo');
    formData.append('contactEmail', 'foo');

    const result = await withZod(EventDetailsSettingsSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      conferenceEnd: 'Invalid date',
      conferenceStart: 'Invalid date',
      contactEmail: 'Invalid email',
      websiteUrl: 'Invalid url',
    });
  });

  it('returns errors if dates are not a valid range', async () => {
    const formData = new FormData();
    formData.append('conferenceStart', '2022-01-02');
    formData.append('conferenceEnd', '2022-01-01');

    const result = await withZod(EventDetailsSettingsSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      conferenceStart: 'Conference start date must be after the conference end date.',
    });
  });

  it('returns errors if start date missing', async () => {
    const formData = new FormData();
    formData.append('conferenceEnd', '2022-01-01');

    const result = await withZod(EventDetailsSettingsSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      conferenceStart: 'Conference start date must be after the conference end date.',
    });
  });

  it('returns errors if end date missing', async () => {
    const formData = new FormData();
    formData.append('conferenceStart', '2022-01-01');

    const result = await withZod(EventDetailsSettingsSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      conferenceStart: 'Conference start date must be after the conference end date.',
    });
  });
});
