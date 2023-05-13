import { EventCfpSettingsSchema } from './event-cfp-settings.schema';
import { parse } from '@conform-to/zod';

describe('Validate EventCfpSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const form = new FormData();
    form.append('type', 'CONFERENCE');
    form.append('cfpStart', '2022-01-01');
    form.append('cfpEnd', '2022-01-02');
    form.append('codeOfConductUrl', 'https://cod.com');
    form.append('maxProposals', '3');

    const result = parse(form, { schema: EventCfpSettingsSchema });
    expect(result.value).toEqual({
      type: 'CONFERENCE',
      cfpStart: new Date('2022-01-01'),
      cfpEnd: new Date('2022-01-02'),
      codeOfConductUrl: 'https://cod.com',
      maxProposals: 3,
    });
  });

  it('resets data', async () => {
    const form = new FormData();
    form.append('type', 'CONFERENCE');
    form.append('cfpStart', '');
    form.append('cfpEnd', '');
    form.append('codeOfConductUrl', '');
    form.append('maxProposals', '');

    const result = parse(form, { schema: EventCfpSettingsSchema });
    expect(result.value).toEqual({
      type: 'CONFERENCE',
      cfpStart: null,
      cfpEnd: null,
      codeOfConductUrl: null,
      maxProposals: null,
    });
  });

  it('returns validation errors', async () => {
    const form = new FormData();
    form.append('type', 'foo');
    form.append('cfpStart', 'foo');
    form.append('cfpEnd', 'foo');
    form.append('codeOfConductUrl', 'foo');
    form.append('maxProposals', 'foo');

    const result = parse(form, { schema: EventCfpSettingsSchema });
    expect(result.error).toEqual({
      cfpEnd: 'Invalid date',
      cfpStart: 'Invalid date',
      codeOfConductUrl: 'Invalid url',
      maxProposals: 'Expected number, received string',
      type: "Invalid enum value. Expected 'CONFERENCE' | 'MEETUP', received 'foo'",
    });
  });

  it('returns errors if dates are not a valid range', async () => {
    const form = new FormData();
    form.append('type', 'CONFERENCE');
    form.append('cfpStart', '2022-01-02');
    form.append('cfpEnd', '2022-01-01');

    const result = parse(form, { schema: EventCfpSettingsSchema });
    expect(result.error).toEqual({
      cfpStart: 'Call for paper start date must be after the end date.',
    });
  });

  it('returns valid if dates are not a valid range but a meetup', async () => {
    const form = new FormData();
    form.append('type', 'MEETUP');
    form.append('cfpStart', '2022-01-02');
    form.append('cfpEnd', '2022-01-01');

    const result = parse(form, { schema: EventCfpSettingsSchema });
    expect(result.error).toEqual({});
  });

  it('returns errors if start date missing', async () => {
    const form = new FormData();
    form.append('type', 'CONFERENCE');
    form.append('cfpEnd', '2022-01-01');

    const result = parse(form, { schema: EventCfpSettingsSchema });
    expect(result.error).toEqual({
      cfpStart: 'Call for paper start date must be after the end date.',
    });
  });

  it('returns errors if end date missing', async () => {
    const form = new FormData();
    form.append('type', 'CONFERENCE');
    form.append('cfpStart', '2022-01-01');

    const result = parse(form, { schema: EventCfpSettingsSchema });
    expect(result.error).toEqual({
      cfpStart: 'Call for paper start date must be after the end date.',
    });
  });
});
