import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';
import { EventNotFoundError } from '../../../libs/errors';
import { getOrganizerEvent } from './get-organizer-event.server';

describe('#getEvent', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the event for organizer', async () => {
    const user = await userFactory();
    const team = await teamFactory({ owners: [user] });
    const event = await eventFactory({
      attributes: {
        name: 'Awesome event',
        slug: 'event',
        visibility: 'PUBLIC',
      },
      traits: ['conference-cfp-open'],
      team,
    });

    const result = await getOrganizerEvent(event.slug, user.id);

    expect(result).toEqual({
      id: event.id,
      name: event.name,
      slug: event.slug,
      type: event.type,
      address: event.address,
      conferenceStart: event.conferenceStart?.toUTCString(),
      conferenceEnd: event.conferenceEnd?.toUTCString(),
      description: event.description,
      visibility: event.visibility,
      websiteUrl: event.websiteUrl,
      codeOfConductUrl: event.codeOfConductUrl,
      contactEmail: event.contactEmail,
      logo: event.logo,
      maxProposals: event.maxProposals,
      surveyEnabled: event.surveyEnabled,
      surveyQuestions: [],
      deliberationEnabled: event.deliberationEnabled,
      displayProposalsRatings: event.displayProposalsRatings,
      displayProposalsSpeakers: event.displayProposalsSpeakers,
      formatsRequired: event.formatsRequired,
      categoriesRequired: event.categoriesRequired,
      emailOrganizer: event.emailOrganizer,
      emailNotifications: [],
      slackWebhookUrl: event.slackWebhookUrl,
      apiKey: event.apiKey,
      cfpStart: event.cfpStart?.toUTCString(),
      cfpEnd: event.cfpEnd?.toUTCString(),
      cfpState: 'OPENED',
      formats: [],
      categories: [],
      archived: false,
    });
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const event = await eventFactory();
    await expect(getOrganizerEvent(event.slug, user.id)).rejects.toThrowError(EventNotFoundError);
  });
});
