import type { Event, Team, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { teamFactory } from 'tests/factories/team';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { rateProposal } from './review-proposal.server';
import { db } from '~/libs/db';
import { DeliberationDisabledError, ForbiddenOperationError } from '~/libs/errors';

describe('#rateProposal', () => {
  let owner: User, speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    speaker = await userFactory();
    team = await teamFactory({ owners: [owner] });
    event = await eventFactory({ team });
  });
  afterEach(disconnectDB);

  it('adds then updates a review for a proposal', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    await rateProposal(event.slug, proposal.id, owner.id, { feeling: 'NEUTRAL', note: 2, comment: 'Why not' });

    const reviews = await db.review.findMany({ where: { userId: owner.id } });
    expect(reviews.length).toBe(1);

    const review = reviews[0];
    expect(review.feeling).toBe('NEUTRAL');
    expect(review.note).toBe(2);
    expect(review.comment).toBe('Why not');

    await rateProposal(event.slug, proposal.id, owner.id, { feeling: 'POSITIVE', note: 5, comment: 'Too good!' });

    const updatedReviews = await db.review.findMany({ where: { userId: owner.id } });
    expect(updatedReviews.length).toBe(1);

    const updatedReview = updatedReviews[0];
    expect(updatedReview.feeling).toBe('POSITIVE');
    expect(updatedReview.note).toBe(5);
    expect(updatedReview.comment).toBe('Too good!');
  });

  it('throws an error if event deliberation is disabled', async () => {
    await db.event.update({ data: { reviewEnabled: false }, where: { id: event.id } });

    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    await expect(
      rateProposal(event.slug, proposal.id, owner.id, { feeling: 'NEUTRAL', note: 2, comment: null })
    ).rejects.toThrowError(DeliberationDisabledError);
  });

  it('throws an error if user does not belong to event team', async () => {
    const user = await userFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await expect(
      rateProposal(event.slug, proposal.id, user.id, { feeling: 'NEUTRAL', note: 2, comment: null })
    ).rejects.toThrowError(ForbiddenOperationError);
  });
});
