import { withZod } from '@remix-validated-form/with-zod';
import {
  EventCfpSettingsSchema,
  EventCreateSchema,
  EventDetailsSettingsSchema,
  EventEmailNotificationsSettingsSchema,
  EventGeneralSettingsSchema,
  EventNotificationsSettingsSchema,
  EventReviewSettingsSchema,
  EventSlackSettingsSchema,
  EventSurveySettingsSchema,
  EventTrackSaveSchema,
  EventTracksSettingsSchema,
} from './event';

describe('Validate EventCreateSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('type', 'CONFERENCE');
    formData.append('name', 'Event name');
    formData.append('visibility', 'PUBLIC');
    formData.append('slug', 'event-name');

    const result = await withZod(EventCreateSchema).validate(formData);
    expect(result.data).toEqual({
      name: 'Event name',
      slug: 'event-name',
      type: 'CONFERENCE',
      visibility: 'PUBLIC',
    });
  });

  it('returns validation errors', async () => {
    const formData = new FormData();
    formData.append('type', 'toto');
    formData.append('name', '');
    formData.append('visibility', 'toto');
    formData.append('slug', '!@#');

    const result = await withZod(EventCreateSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      name: 'Required',
      slug: 'Must only contain lower case alphanumeric and dashes (-).',
      type: "Invalid enum value. Expected 'CONFERENCE' | 'MEETUP', received 'toto'",
      visibility: "Invalid enum value. Expected 'PUBLIC' | 'PRIVATE', received 'toto'",
    });
  });
});

describe('Validate EventGeneralSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('name', 'Event name');
    formData.append('visibility', 'PUBLIC');
    formData.append('slug', 'event-name');

    const result = await withZod(EventGeneralSettingsSchema).validate(formData);
    expect(result.data).toEqual({
      name: 'Event name',
      slug: 'event-name',
      visibility: 'PUBLIC',
    });
  });

  it('returns validation errors', async () => {
    const formData = new FormData();
    formData.append('name', '');
    formData.append('visibility', 'toto');
    formData.append('slug', '!@#');

    const result = await withZod(EventGeneralSettingsSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      name: 'Required',
      slug: 'Must only contain lower case alphanumeric and dashes (-).',
      visibility: "Invalid enum value. Expected 'PUBLIC' | 'PRIVATE', received 'toto'",
    });
  });
});

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

describe('Validate EventTracksSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('formatsRequired', 'true');
    formData.append('categoriesRequired', 'false');

    const result = await withZod(EventTracksSettingsSchema).validate(formData);
    expect(result.data).toEqual({ formatsRequired: true, categoriesRequired: false });
  });

  it('returns falsy values on other values', async () => {
    const formData = new FormData();
    formData.append('formatsRequired', 'foo');
    formData.append('categoriesRequired', 'foo');

    const result = await withZod(EventTracksSettingsSchema).validate(formData);
    expect(result.data).toEqual({ formatsRequired: false, categoriesRequired: false });
  });
});

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

describe('Validate EventSurveySettingsSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('surveyQuestions', 'Question 1');
    formData.append('surveyQuestions', 'Question 2');

    const result = await withZod(EventSurveySettingsSchema).validate(formData);
    expect(result.data).toEqual({ surveyQuestions: ['Question 1', 'Question 2'] });
  });
});

describe('Validate EventReviewSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('displayOrganizersRatings', 'on');
    formData.append('displayProposalsSpeakers', 'on');

    const result = await withZod(EventReviewSettingsSchema).validate(formData);
    expect(result.data).toEqual({
      displayOrganizersRatings: true,
      displayProposalsRatings: false,
      displayProposalsSpeakers: true,
    });
  });

  it('returns errors if values are invalid', async () => {
    const formData = new FormData();
    formData.append('displayOrganizersRatings', 'foo');
    formData.append('displayProposalsRatings', 'foo');
    formData.append('displayProposalsSpeakers', 'foo');

    const result = await withZod(EventReviewSettingsSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      displayOrganizersRatings: 'Invalid literal value, expected "on"',
      displayProposalsRatings: 'Invalid literal value, expected "on"',
      displayProposalsSpeakers: 'Invalid literal value, expected "on"',
    });
  });
});

describe('Validate EventNotificationsSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('emailNotifications', 'Notif 1');
    formData.append('emailNotifications', 'Notif 2');

    const result = await withZod(EventNotificationsSettingsSchema).validate(formData);
    expect(result.data).toEqual({ emailNotifications: ['Notif 1', 'Notif 2'] });
  });
});

describe('Validate EventEmailNotificationsSettingsSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('emailOrganizer', 'orga@email.com');

    const result = await withZod(EventEmailNotificationsSettingsSchema).validate(formData);
    expect(result.data).toEqual({ emailOrganizer: 'orga@email.com' });
  });

  it('returns validation errors', async () => {
    const formData = new FormData();
    formData.append('emailOrganizer', 'foo');

    const result = await withZod(EventEmailNotificationsSettingsSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      emailOrganizer: 'Invalid email',
    });
  });
});

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

describe('Validate EventTrackSaveSchema', () => {
  it('validates valid inputs', async () => {
    const formData = new FormData();
    formData.append('id', '123');
    formData.append('name', 'Track 1');
    formData.append('description', 'Track description');

    const result = await withZod(EventTrackSaveSchema).validate(formData);
    expect(result.data).toEqual({
      id: '123',
      name: 'Track 1',
      description: 'Track description',
    });
  });

  it('validates valid inputs without id', async () => {
    const formData = new FormData();
    formData.append('name', 'Track 1');
    formData.append('description', 'Track description');

    const result = await withZod(EventTrackSaveSchema).validate(formData);
    expect(result.data).toEqual({
      name: 'Track 1',
      description: 'Track description',
    });
  });

  it('returns validation errors', async () => {
    const formData = new FormData();
    formData.append('name', '');
    formData.append('description', '');

    const result = await withZod(EventTrackSaveSchema).validate(formData);
    expect(result.error?.fieldErrors).toEqual({
      name: 'Required',
    });
  });
});
