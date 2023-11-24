import type { Event, EventCategory, EventFormat, Team, User } from '@prisma/client';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { messageFactory } from 'tests/factories/messages.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.ts';
import { ForbiddenOperationError } from '~/libs/errors.ts';

import { getProposalReview } from './get-proposal-review.server.ts';

describe('#getProposalReview', () => {
  let owner: User, member: User, speaker: User;
  let team: Team;
  let event: Event;
  let format: EventFormat;
  let category: EventCategory;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner, member] });
    event = await eventFactory({ team });
    format = await eventFormatFactory({ event });
    category = await eventCategoryFactory({ event });
  });

  it('returns proposal review data', async () => {
    const proposal = await proposalFactory({
      event,
      formats: [format],
      categories: [category],
      talk: await talkFactory({ speakers: [speaker] }),
    });

    const reviewInfo = await getProposalReview(event.slug, proposal.id, owner.id, {});

    expect(reviewInfo.pagination).toEqual({ current: 1, total: 1, previousId: undefined, nextId: undefined });
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
      speakers: [{ id: speaker.id, name: speaker.name, picture: speaker.picture, company: speaker.company }],
      reviews: {
        summary: { average: null, negatives: 0, positives: 0 },
        you: { feeling: null, note: null, comment: null },
      },
      reviewsCount: 0,
      messagesCount: 0,
    });
    expect(reviewInfo.reviewEnabled).toBeTruthy();
  });

  it('does not returns speakers when display proposals speaker setting is false', async () => {
    await db.event.update({ data: { displayProposalsSpeakers: false }, where: { id: event.id } });

    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    const reviewInfo = await getProposalReview(event.slug, proposal.id, owner.id, {});

    expect(reviewInfo.proposal.speakers).toEqual([]);
  });

  it('returns teams reviews', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await reviewFactory({ proposal, user: owner, attributes: { feeling: 'NEGATIVE', note: 0, comment: 'Booo' } });
    await reviewFactory({ proposal, user: member, attributes: { feeling: 'POSITIVE', note: 5 } });

    const reviewInfo = await getProposalReview(event.slug, proposal.id, owner.id, {});

    expect(reviewInfo.proposal.reviews).toEqual({
      summary: { average: 2.5, positives: 1, negatives: 1 },
      you: { note: 0, feeling: 'NEGATIVE', comment: 'Booo' },
    });
  });

  it('does not returns reviews summary when display proposals reviews setting is false', async () => {
    await db.event.update({ data: { displayProposalsReviews: false }, where: { id: event.id } });

    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await reviewFactory({ proposal, user: owner, attributes: { feeling: 'NEGATIVE', note: 0, comment: 'Booo' } });

    const reviewInfo = await getProposalReview(event.slug, proposal.id, owner.id, {});

    expect(reviewInfo.proposal.reviews).toEqual({
      summary: undefined,
      you: { note: 0, feeling: 'NEGATIVE', comment: 'Booo' },
    });
  });

  it('returns teams messages', async () => {
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

  it.todo('should hide speakers when display proposals speakers setting is false');

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

  it('throws an error if user does not belong to event team', async () => {
    const user = await userFactory();
    const event = await eventFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });
    await expect(getProposalReview(event.slug, proposal.id, user.id, {})).rejects.toThrowError(ForbiddenOperationError);
  });
});
