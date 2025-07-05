import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { eventProposalTagFactory } from 'tests/factories/proposal-tags.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ApiKeyInvalidError, EventNotFoundError } from '~/shared/errors.server.ts';
import { EventProposalsApi } from './proposals-api.server.ts';

describe('#EventProposalsApi', () => {
  describe('#proposals', () => {
    it('return proposals from api', async () => {
      const speaker = await userFactory();
      const event = await eventFactory({ attributes: { apiKey: '123' }, traits: ['conference'] });
      const format = await eventFormatFactory({ event });
      const category = await eventCategoryFactory({ event });
      const tag = await eventProposalTagFactory({ event });

      const proposal = await proposalFactory({
        event,
        formats: [format],
        categories: [category],
        tags: [tag],
        talk: await talkFactory({ speakers: [speaker], attributes: { level: 'BEGINNER', languages: ['fr'] } }),
        traits: ['confirmed'],
      });
      const review = await reviewFactory({ proposal, user: speaker });

      const eventApi = new EventProposalsApi(event.slug, '123');
      const result = await eventApi.proposals({});

      expect(result).toEqual({
        startDate: event.conferenceStart,
        endDate: event.conferenceEnd,
        name: event.name,
        proposals: [
          {
            title: proposal.title,
            abstract: proposal.abstract,
            level: 'BEGINNER',
            references: proposal.references,
            formats: [format.name],
            id: proposal.id,
            categories: [category.name],
            tags: [tag.name],
            deliberationStatus: 'ACCEPTED',
            publicationStatus: 'PUBLISHED',
            confirmationStatus: 'CONFIRMED',
            languages: ['fr'],
            speakers: [
              {
                name: speaker.name,
                bio: speaker.bio,
                company: speaker.company,
                references: speaker.references,
                location: speaker.location,
                picture: speaker.picture,
                email: speaker.email,
                socialLinks: speaker.socialLinks,
              },
            ],
            review: {
              average: review.note,
              positives: 0,
              negatives: 0,
            },
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

      const eventApi = new EventProposalsApi(event.slug, '123');
      const result = await eventApi.proposals({ status: 'accepted' });

      expect(result.proposals.length).toBe(1);
      expect(result.proposals[0].title).toBe(proposal.title);
    });

    it('returns an error when event not found', async () => {
      await eventFactory({ attributes: { apiKey: '123' } });
      const eventApi = new EventProposalsApi('xxx', '123');
      await expect(eventApi.proposals({})).rejects.toThrowError(EventNotFoundError);
    });

    it('returns an error when Api key mismatch', async () => {
      const event = await eventFactory({ attributes: { apiKey: '123' } });
      const eventApi = new EventProposalsApi(event.slug, '456');
      await expect(eventApi.proposals({})).rejects.toThrowError(ApiKeyInvalidError);
    });
  });
});
