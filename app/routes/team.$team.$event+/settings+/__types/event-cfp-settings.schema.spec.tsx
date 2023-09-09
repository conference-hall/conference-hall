import { parse } from '@conform-to/zod';
import { describe, expect, it } from 'vitest';

import { CfpConferenceOpeningSchema, CfpMeetupOpeningSchema, CfpPreferencesSchema } from './event-cfp-settings.schema';

describe('Validate CfpPreferencesSchema', () => {
  it('validates valid inputs', async () => {
    const form = new FormData();
    form.append('codeOfConductUrl', 'https://cod.com');
    form.append('maxProposals', '3');

    const result = parse(form, { schema: CfpPreferencesSchema });
    expect(result.value).toEqual({
      codeOfConductUrl: 'https://cod.com',
      maxProposals: 3,
    });
  });

  it('resets data', async () => {
    const form = new FormData();
    form.append('codeOfConductUrl', '');
    form.append('maxProposals', '');

    const result = parse(form, { schema: CfpPreferencesSchema });
    expect(result.value).toEqual({
      codeOfConductUrl: null,
      maxProposals: null,
    });
  });

  it('returns validation errors', async () => {
    const form = new FormData();
    form.append('codeOfConductUrl', 'foo');
    form.append('maxProposals', 'foo');

    const result = parse(form, { schema: CfpPreferencesSchema });
    expect(result.error).toEqual({
      codeOfConductUrl: ['Invalid url'],
      maxProposals: ['Expected number, received nan'],
    });
  });
});

describe('Validate CfpConferenceOpeningSchema', () => {
  it('validates valid inputs', async () => {
    const form = new FormData();
    form.append('cfpStart', '2022-01-01');
    form.append('cfpEnd', '2022-01-02');

    const result = parse(form, { schema: CfpConferenceOpeningSchema });
    expect(result.value).toEqual({
      cfpStart: new Date('2022-01-01'),
      cfpEnd: new Date('2022-01-02'),
    });
  });

  it('resets data', async () => {
    const form = new FormData();
    form.append('cfpStart', '');
    form.append('cfpEnd', '');

    const result = parse(form, { schema: CfpConferenceOpeningSchema });
    expect(result.value).toEqual({
      cfpStart: null,
      cfpEnd: null,
    });
  });

  it('returns validation errors', async () => {
    const form = new FormData();
    form.append('cfpStart', 'foo');
    form.append('cfpEnd', 'foo');

    const result = parse(form, { schema: CfpConferenceOpeningSchema });
    expect(result.error).toEqual({
      cfpStart: ['Invalid date'],
    });
  });

  it('returns errors if dates are not a valid range', async () => {
    const form = new FormData();
    form.append('cfpStart', '2022-01-02');
    form.append('cfpEnd', '2022-01-01');

    const result = parse(form, { schema: CfpConferenceOpeningSchema });
    expect(result.error).toEqual({
      cfpStart: ['Call for paper start date must be after the end date.'],
    });
  });

  it('returns errors if start date missing', async () => {
    const form = new FormData();
    form.append('cfpEnd', '2022-01-01');

    const result = parse(form, { schema: CfpConferenceOpeningSchema });
    expect(result.error).toEqual({
      cfpStart: ['Call for paper start date must be after the end date.'],
    });
  });

  it('returns errors if end date missing', async () => {
    const form = new FormData();
    form.append('cfpStart', '2022-01-01');

    const result = parse(form, { schema: CfpConferenceOpeningSchema });
    expect(result.error).toEqual({
      cfpStart: ['Call for paper start date must be after the end date.'],
    });
  });
});

describe('Validate CfpMeetupOpeningSchema', () => {
  it('validates valid inputs', async () => {
    const form = new FormData();
    form.append('cfpStart', '2022-01-01');

    const result = parse(form, { schema: CfpMeetupOpeningSchema });
    expect(result.value).toEqual({
      cfpStart: new Date('2022-01-01'),
    });
  });

  it('resets data', async () => {
    const form = new FormData();
    form.append('cfpStart', '');

    const result = parse(form, { schema: CfpMeetupOpeningSchema });
    expect(result.value).toEqual({
      cfpStart: null,
    });
  });

  it('returns validation errors', async () => {
    const form = new FormData();
    form.append('cfpStart', 'foo');

    const result = parse(form, { schema: CfpMeetupOpeningSchema });
    expect(result.error).toEqual({
      cfpStart: ['Invalid date'],
    });
  });
});
