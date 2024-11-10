import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { teamFactory } from 'tests/factories/team.ts';

import { EventNotFoundError } from '~/libs/errors.server.ts';

import { EventPage } from './event-page.ts';

describe('EventPage', () => {
  describe('#get', () => {
    it('returns the default response', async () => {
      const team = await teamFactory();
      const event = await eventFactory({ team, traits: ['conference-cfp-open', 'withSurvey'] });
      const format = await eventFormatFactory({ event });
      const category = await eventCategoryFactory({ event });

      const result = await EventPage.of(event.slug).get();

      expect(result).toEqual({
        id: event.id,
        slug: event.slug,
        type: event.type,
        name: event.name,
        teamName: team.name,
        onlineEvent: event.onlineEvent,
        location: event.location,
        timezone: event.timezone,
        conferenceStart: event.conferenceStart,
        conferenceEnd: event.conferenceEnd,
        description: event.description,
        websiteUrl: event.websiteUrl,
        contactEmail: event.contactEmail,
        codeOfConductUrl: event.codeOfConductUrl,
        logoUrl: event.logoUrl,
        maxProposals: event.maxProposals,
        cfpStart: event.cfpStart,
        cfpEnd: event.cfpEnd,
        cfpState: 'OPENED',
        isCfpOpen: true,
        surveyEnabled: true,
        hasTracks: true,
        formats: [{ id: format.id, name: format.name, description: format.description }],
        formatsRequired: false,
        formatsAllowMultiple: false,
        categories: [
          {
            id: category.id,
            name: category.name,
            description: category.description,
          },
        ],
        categoriesRequired: false,
        categoriesAllowMultiple: false,
      });
    });

    it('throws an error when event not found', async () => {
      await expect(EventPage.of('XXX').get()).rejects.toThrowError(EventNotFoundError);
    });
  });
});
