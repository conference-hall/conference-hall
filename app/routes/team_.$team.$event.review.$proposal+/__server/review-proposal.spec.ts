import type { Event, Team, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.ts';
import { DeliberationDisabledError, ForbiddenOperationError } from '~/libs/errors.ts';

import { rateProposal } from './review-proposal.server.ts';

describe('#rateProposal', () => {
  let owner: User, owner2: User, speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory();
    owner2 = await userFactory();
    speaker = await userFactory();
    team = await teamFactory({ owners: [owner, owner2] });
    event = await eventFactory({ team });
  });

  it('adds then updates a review for a proposal', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    // First review
    await rateProposal(event.slug, proposal.id, owner.id, { feeling: 'NEUTRAL', note: 2, comment: 'Why not' });

    const reviews1 = await db.review.findMany({ where: { userId: owner.id }, include: { proposal: true } });
    expect(reviews1.length).toBe(1);

    const review = reviews1[0];
    expect(review.feeling).toBe('NEUTRAL');
    expect(review.note).toBe(2);
    expect(review.comment).toBe('Why not');
    expect(review.proposal.avgRateForSort).toBe(2);

    // Update first review
    await rateProposal(event.slug, proposal.id, owner.id, { feeling: 'POSITIVE', note: 5, comment: 'Too good!' });

    const reviews2 = await db.review.findMany({ where: { userId: owner.id }, include: { proposal: true } });
    expect(reviews2.length).toBe(1);

    const updatedReview = reviews2[0];
    expect(updatedReview.feeling).toBe('POSITIVE');
    expect(updatedReview.note).toBe(5);
    expect(updatedReview.comment).toBe('Too good!');
    expect(updatedReview.proposal.avgRateForSort).toBe(5);

    // Second review
    await rateProposal(event.slug, proposal.id, owner2.id, { feeling: 'NEUTRAL', note: 0, comment: 'Too bad!' });

    const reviews3 = await db.review.findMany({ where: { proposalId: proposal.id }, include: { proposal: true } });
    expect(reviews3.length).toBe(2);
    expect(reviews3[0].proposal.avgRateForSort).toBe(2.5);
  });

  it('throws an error if event deliberation is disabled', async () => {
    await db.event.update({ data: { reviewEnabled: false }, where: { id: event.id } });

    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    await expect(
      rateProposal(event.slug, proposal.id, owner.id, { feeling: 'NEUTRAL', note: 2, comment: null }),
    ).rejects.toThrowError(DeliberationDisabledError);
  });

  it('throws an error if user does not belong to event team', async () => {
    const user = await userFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await expect(
      rateProposal(event.slug, proposal.id, user.id, { feeling: 'NEUTRAL', note: 2, comment: null }),
    ).rejects.toThrowError(ForbiddenOperationError);
  });
});
