import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events';
import { eventFormatFactory } from 'tests/factories/formats';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ApiKeyInvalidError, EventNotFoundError } from '~/libs/errors';

import { getEventProposals } from './get-event-proposals.server';

describe('#getEventProposals', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(async () => {
    await disconnectDB();
  });

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

    const result = await getEventProposals(event.slug, '123', {});

    expect(result).toEqual({
      name: event.name,
      proposals: [
        {
          title: proposal.title,
          abstract: proposal.abstract,
          level: 'Beginner',
          formats: [format.name],
          categories: [category.name],
          languages: ['French'],
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

    await proposalFactory({
      event,
      traits: ['submitted'],
      talk: await talkFactory({ speakers: [speaker] }),
    });

    const result = await getEventProposals(event.slug, '123', { status: ['ACCEPTED'] });

    expect(result.proposals.length).toBe(1);
    expect(result.proposals[0].title).toBe(proposal.title);
  });

  it('returns an error when event not found', async () => {
    await eventFactory({ attributes: { apiKey: '123' } });
    await expect(getEventProposals('xxx', '123', {})).rejects.toThrowError(EventNotFoundError);
  });

  it('returns an error when Api key mismatch', async () => {
    const event = await eventFactory({ attributes: { apiKey: '123' } });
    await expect(getEventProposals(event.slug, '456', {})).rejects.toThrowError(ApiKeyInvalidError);
  });
});
