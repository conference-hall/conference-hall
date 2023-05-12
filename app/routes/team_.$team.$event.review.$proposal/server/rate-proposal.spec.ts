import type { Event, Team, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { teamFactory } from 'tests/factories/team';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { rateProposal } from './rate-proposal.server';
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

  it('adds then updates a rating for a proposal', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    await rateProposal(event.slug, proposal.id, owner.id, { feeling: 'NEUTRAL', rating: 2, comment: 'Why not' });

    const ratings = await db.rating.findMany({ where: { userId: owner.id } });
    expect(ratings.length).toBe(1);

    const rating = ratings[0];
    expect(rating.feeling).toBe('NEUTRAL');
    expect(rating.rating).toBe(2);
    expect(rating.comment).toBe('Why not');

    await rateProposal(event.slug, proposal.id, owner.id, { feeling: 'POSITIVE', rating: 5, comment: 'Too good!' });

    const updatedRatings = await db.rating.findMany({ where: { userId: owner.id } });
    expect(updatedRatings.length).toBe(1);

    const updatedRating = updatedRatings[0];
    expect(updatedRating.feeling).toBe('POSITIVE');
    expect(updatedRating.rating).toBe(5);
    expect(updatedRating.comment).toBe('Too good!');
  });

  it('throws an error if event deliberation is disabled', async () => {
    await db.event.update({ data: { deliberationEnabled: false }, where: { id: event.id } });

    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    await expect(
      rateProposal(event.slug, proposal.id, owner.id, { feeling: 'NEUTRAL', rating: 2, comment: null })
    ).rejects.toThrowError(DeliberationDisabledError);
  });

  it('throws an error if user does not belong to event team', async () => {
    const user = await userFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await expect(
      rateProposal(event.slug, proposal.id, user.id, { feeling: 'NEUTRAL', rating: 2, comment: null })
    ).rejects.toThrowError(ForbiddenOperationError);
  });
});
