import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { EventNotFoundError } from '~/shared/errors.server.ts';
import { EventFetcher } from './event-fetcher.server.ts';

describe('EventFetcher', () => {
  describe('#get', () => {
    it('returns the event for organizer', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });
      const event = await eventFactory({
        attributes: {
          name: 'Awesome event',
          slug: 'event',
          visibility: 'PUBLIC',
        },
        traits: ['conference-cfp-open', 'withIntegration'],
        team,
      });

      const result = await EventFetcher.for(user.id, team.slug, event.slug).get();

      expect(result).toEqual({
        id: event.id,
        name: event.name,
        slug: event.slug,
        type: event.type,
        location: event.location,
        onlineEvent: event.onlineEvent,
        timezone: event.timezone,
        conferenceStart: event.conferenceStart,
        conferenceEnd: event.conferenceEnd,
        description: event.description,
        visibility: event.visibility,
        websiteUrl: event.websiteUrl,
        codeOfConductUrl: event.codeOfConductUrl,
        contactEmail: event.contactEmail,
        logoUrl: event.logoUrl,
        maxProposals: event.maxProposals,
        reviewEnabled: event.reviewEnabled,
        displayProposalsReviews: event.displayProposalsReviews,
        displayProposalsSpeakers: event.displayProposalsSpeakers,
        formatsRequired: event.formatsRequired,
        formatsAllowMultiple: event.formatsAllowMultiple,
        categoriesRequired: event.categoriesRequired,
        categoriesAllowMultiple: event.categoriesAllowMultiple,
        emailOrganizer: event.emailOrganizer,
        emailNotifications: [],
        slackWebhookUrl: event.slackWebhookUrl,
        apiKey: event.apiKey,
        integrations: ['OPEN_PLANNER'],
        cfpStart: event.cfpStart,
        cfpEnd: event.cfpEnd,
        cfpState: 'OPENED',
        formats: [],
        categories: [],
        tags: [],
        archived: false,
      });
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const team = await teamFactory();
      const event = await eventFactory({ team });
      await expect(EventFetcher.for(user.id, team.slug, event.slug).get()).rejects.toThrowError(EventNotFoundError);
    });

    it('throws an error if event does not belong to team', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });
      const team2 = await teamFactory({ owners: [user] });
      const event = await eventFactory({ team: team2 });
      await expect(EventFetcher.for(user.id, team.slug, event.slug).get()).rejects.toThrowError(EventNotFoundError);
    });
  });
});
