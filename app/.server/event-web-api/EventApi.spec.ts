import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ApiKeyInvalidError, EventNotFoundError } from '~/libs/errors.server.ts';

import { EventApi } from './EventApi.ts';

describe('#EventApi', () => {
  describe('#proposals', () => {
    it('return proposals from api', async () => {
      const speaker = await userFactory();
      const event = await eventFactory({ attributes: { apiKey: '123' } });
      const format = await eventFormatFactory({ event });
      const category = await eventCategoryFactory({ event });

      const proposal = await proposalFactory({
        event,
        formats: [format],
        categories: [category],
        talk: await talkFactory({ speakers: [speaker], attributes: { level: 'BEGINNER', languages: ['fr'] } }),
      });

      const eventApi = new EventApi(event.slug, '123');
      const result = await eventApi.proposals({});

      expect(result).toEqual({
        name: event.name,
        proposals: [
          {
            title: proposal.title,
            abstract: proposal.abstract,
            level: 'BEGINNER',
            formats: [format.name],
            categories: [category.name],
            languages: ['fr'],
            speakers: [
              {
                name: speaker.name,
                bio: speaker.bio,
                company: speaker.company,
                picture: speaker.picture,
                socials: speaker.socials,
              },
            ],
          },
        ],
      });
    });

    it('can filters proposals like in the proposals search', async () => {
      const speaker = await userFactory();
      const event = await eventFactory({ attributes: { apiKey: '123' } });

      const proposal = await proposalFactory({
        event,
        traits: ['accepted'],
        talk: await talkFactory({ speakers: [speaker] }),
      });

      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const eventApi = new EventApi(event.slug, '123');
      const result = await eventApi.proposals({ status: 'accepted' });

      expect(result.proposals.length).toBe(1);
      expect(result.proposals[0].title).toBe(proposal.title);
    });

    it('returns an error when event not found', async () => {
      await eventFactory({ attributes: { apiKey: '123' } });
      const eventApi = new EventApi('xxx', '123');
      await expect(eventApi.proposals({})).rejects.toThrowError(EventNotFoundError);
    });

    it('returns an error when Api key mismatch', async () => {
      const event = await eventFactory({ attributes: { apiKey: '123' } });
      const eventApi = new EventApi(event.slug, '456');
      await expect(eventApi.proposals({})).rejects.toThrowError(ApiKeyInvalidError);
    });
  });
});
