import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
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

      const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const result = await EventFetcher.for(authorizedEvent).get();

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
        speakersConversationEnabled: true,
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
  });
});
