import { withZod } from '@remix-validated-form/with-zod';
import { EventCfpSettingsSchema } from './event-cfp-settings.schema';

describe('Validate EventCfpSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('type', 'CONFERENCE');
    formData.append('cfpStart', '2022-01-01');
    formData.append('cfpEnd', '2022-01-02');
    formData.append('codeOfConductUrl', 'https://cod.com');
    formData.append('maxProposals', '3');

    const result = await withZod(EventCfpSettingsSchema).validate(formData);
    expect(result.data).toEqual({
      type: 'CONFERENCE',
      cfpStart: new Date('2022-01-01'),
      cfpEnd: new Date('2022-01-02'),
      codeOfConductUrl: 'https://cod.com',
      maxProposals: 3,
    });
  });

  it('resets data', async () => {
    const formData = new FormData();
    formData.append('type', 'CONFERENCE');
    formData.append('cfpStart', '');
    formData.append('cfpEnd', '');
    formData.append('codeOfConductUrl', '');
    formData.append('maxProposals', '');

    const result = await withZod(EventCfpSettingsSchema).validate(formData);
    expect(result.data).toEqual({
      type: 'CONFERENCE',
      cfpStart: null,
      cfpEnd: null,
      codeOfConductUrl: null,
      maxProposals: null,
    });
  });

  it('returns validation errors', async () => {
    const formData = new FormData();
    formData.append('type', 'foo');
    formData.append('cfpStart', 'foo');
    formData.append('cfpEnd', 'foo');
    formData.append('codeOfConductUrl', 'foo');
    formData.append('maxProposals', 'foo');

    const result = await withZod(EventCfpSettingsSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      cfpEnd: 'Invalid date',
      cfpStart: 'Invalid date',
      codeOfConductUrl: 'Invalid url',
      maxProposals: 'Expected number, received string',
      type: "Invalid enum value. Expected 'CONFERENCE' | 'MEETUP', received 'foo'",
    });
  });

  it('returns errors if dates are not a valid range', async () => {
    const formData = new FormData();
    formData.append('type', 'CONFERENCE');
    formData.append('cfpStart', '2022-01-02');
    formData.append('cfpEnd', '2022-01-01');

    const result = await withZod(EventCfpSettingsSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      cfpStart: 'Call for paper start date must be after the end date.',
    });
  });

  it('returns valid if dates are not a valid range but a meetup', async () => {
    const formData = new FormData();
    formData.append('type', 'MEETUP');
    formData.append('cfpStart', '2022-01-02');
    formData.append('cfpEnd', '2022-01-01');

    const result = await withZod(EventCfpSettingsSchema).validate(formData);
    expect(result.error?.fieldErrors).toBeUndefined();
  });

  it('returns errors if start date missing', async () => {
    const formData = new FormData();
    formData.append('type', 'CONFERENCE');
    formData.append('cfpEnd', '2022-01-01');

    const result = await withZod(EventCfpSettingsSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      cfpStart: 'Call for paper start date must be after the end date.',
    });
  });

  it('returns errors if end date missing', async () => {
    const formData = new FormData();
    formData.append('type', 'CONFERENCE');
    formData.append('cfpStart', '2022-01-01');

    const result = await withZod(EventCfpSettingsSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      cfpStart: 'Call for paper start date must be after the end date.',
    });
  });
});
