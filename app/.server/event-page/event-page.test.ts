import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { teamFactory } from 'tests/factories/team.ts';

import { EventNotFoundError } from '~/libs/errors.server.ts';

import { EventPage } from './event-page.ts';

describe('EventPage', () => {
  describe('#get', () => {
    it('returns the event informations', async () => {
      const team = await teamFactory();
      const event = await eventFactory({ team, traits: ['conference-cfp-open', 'withSurveyConfig'] });
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
        hasSurvey: true,
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

  describe('#buildTracksSchema', () => {
    it('validates tracks form inputs', async () => {
      const event = await eventFactory();
      const format = await eventFormatFactory({ event });
      const category = await eventCategoryFactory({ event });

      const schema = await EventPage.of(event.slug).buildTracksSchema();
      const result = schema.safeParse({ formats: [format.name], categories: [category.name] });

      expect(result.success && result.data).toEqual({ formats: [format.name], categories: [category.name] });
    });

    it('validates tracks when no tracks', async () => {
      const event = await eventFactory();
      await eventFormatFactory({ event });
      await eventCategoryFactory({ event });

      const schema = await EventPage.of(event.slug).buildTracksSchema();
      const result = schema.safeParse({ formats: [], categories: [] });

      expect(result.success && result.data).toEqual({ formats: [], categories: [] });
    });

    it('returns errors when no tracks and tracks are mandatory', async () => {
      const event = await eventFactory({ attributes: { formatsRequired: true, categoriesRequired: true } });
      await eventFormatFactory({ event });
      await eventCategoryFactory({ event });

      const schema = await EventPage.of(event.slug).buildTracksSchema();
      const result = schema.safeParse({ formats: [], categories: [] });

      const errors = result.error?.flatten();
      expect(errors?.fieldErrors.formats).toEqual(['Array must contain at least 1 element(s)']);
      expect(errors?.fieldErrors.categories).toEqual(['Array must contain at least 1 element(s)']);
    });
  });

  describe('#getByLegacyId', () => {
    it('returns the event corresponding to the legacy Conference Hall id', async () => {
      const event = await eventFactory({ attributes: { migrationId: 'legacy-event-id' } });

      const result = await EventPage.getByLegacyId('legacy-event-id');

      expect(result.id).toEqual(event.id);
    });

    it('throws an error when event not found', async () => {
      await expect(EventPage.getByLegacyId('unknown-event-id')).rejects.toThrowError(EventNotFoundError);
    });
  });
});
