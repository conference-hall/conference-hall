import type { Event, EventCategory, EventFormat, Team, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events';
import { eventFormatFactory } from 'tests/factories/formats';
import { messageFactory } from 'tests/factories/messages';
import { teamFactory } from 'tests/factories/team';
import { proposalFactory } from 'tests/factories/proposals';
import { ratingFactory } from 'tests/factories/ratings';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { getProposalReview } from './get-proposal-review.server';
import { ForbiddenOperationError } from '~/libs/errors';
import { db } from '~/libs/db';

describe('#getProposalReview', () => {
  let owner: User, member: User, speaker: User;
  let team: Team;
  let event: Event;
  let format: EventFormat;
  let category: EventCategory;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner, member] });
    event = await eventFactory({ team });
    format = await eventFormatFactory({ event });
    category = await eventCategoryFactory({ event });
  });
  afterEach(disconnectDB);

  it('returns proposal review data', async () => {
    const proposal = await proposalFactory({
      event,
      formats: [format],
      categories: [category],
      talk: await talkFactory({ speakers: [speaker] }),
    });

    const reviewInfo = await getProposalReview(event.slug, proposal.id, owner.id, {});

    expect(reviewInfo.pagination).toEqual({ current: 1, total: 1, previousId: proposal.id, nextId: proposal.id });
    expect(reviewInfo.proposal).toEqual({
      id: proposal.id,
      title: proposal.title,
      abstract: proposal.abstract,
      references: proposal.references,
      comments: proposal.comments,
      level: proposal.level,
      status: proposal.status,
      createdAt: proposal.createdAt.toUTCString(),
      languages: ['en'],
      formats: [{ id: format.id, name: format.name }],
      categories: [{ id: category.id, name: category.name }],
      speakers: [{ id: speaker.id, name: speaker.name, picture: speaker.picture }],
      reviews: {
        summary: { average: null, negatives: 0, positives: 0 },
        you: { feeling: null, rating: null, comment: null },
      },
      reviewsCount: 0,
      messagesCount: 0,
    });
    expect(reviewInfo.deliberationEnabled).toBeTruthy();
  });

  it('does not returns speakers when display proposals speaker setting is false', async () => {
    await db.event.update({ data: { displayProposalsSpeakers: false }, where: { id: event.id } });

    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    const reviewInfo = await getProposalReview(event.slug, proposal.id, owner.id, {});

    expect(reviewInfo.proposal.speakers).toEqual([]);
  });

  it('returns organizers reviews', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await ratingFactory({ proposal, user: owner, attributes: { feeling: 'NEGATIVE', rating: 0, comment: 'Booo' } });
    await ratingFactory({ proposal, user: member, attributes: { feeling: 'POSITIVE', rating: 5 } });

    const reviewInfo = await getProposalReview(event.slug, proposal.id, owner.id, {});

    expect(reviewInfo.proposal.reviews).toEqual({
      summary: { average: 2.5, positives: 1, negatives: 1 },
      you: { rating: 0, feeling: 'NEGATIVE', comment: 'Booo' },
    });
  });

  it('does not returns reviews summary when display proposals reviews setting is false', async () => {
    await db.event.update({ data: { displayProposalsRatings: false }, where: { id: event.id } });

    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await ratingFactory({ proposal, user: owner, attributes: { feeling: 'NEGATIVE', rating: 0, comment: 'Booo' } });

    const reviewInfo = await getProposalReview(event.slug, proposal.id, owner.id, {});

    expect(reviewInfo.proposal.reviews).toEqual({
      summary: undefined,
      you: { rating: 0, feeling: 'NEGATIVE', comment: 'Booo' },
    });
  });

  it('returns organizers messages', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await messageFactory({ proposal, user: owner, attributes: { message: 'Message 1' } });
    await messageFactory({ proposal, user: member, attributes: { message: 'Message 2' } });

    const reviewInfo = await getProposalReview(event.slug, proposal.id, owner.id, {});

    expect(reviewInfo.proposal.messagesCount).toEqual(2);
  });

  it('returns pagination for next and previous proposals', async () => {
    const proposal1 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const proposal2 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const proposal3 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    const reviewInfo = await getProposalReview(event.slug, proposal2.id, owner.id, {});

    expect(reviewInfo.pagination).toEqual({
      current: 2,
      total: 3,
      nextId: proposal1.id,
      previousId: proposal3.id,
    });
  });

  it('returns pagination for next and previous proposals with filters', async () => {
    const proposal1 = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker], attributes: { title: 'foo' } }),
    });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker], attributes: { title: 'bar' } }) });
    const proposal3 = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker], attributes: { title: 'foo' } }),
    });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker], attributes: { title: 'bar' } }) });
    const proposal5 = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker], attributes: { title: 'foo' } }),
    });

    const reviewInfo = await getProposalReview(event.slug, proposal3.id, owner.id, { query: 'foo' });

    expect(reviewInfo.pagination).toEqual({
      current: 2,
      total: 3,
      nextId: proposal1.id,
      previousId: proposal5.id,
    });
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const event = await eventFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });
    await expect(getProposalReview(event.slug, proposal.id, user.id, {})).rejects.toThrowError(ForbiddenOperationError);
  });
});
