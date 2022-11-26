import type { Event, Organization, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { organizationFactory } from 'tests/factories/organization';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { db } from '../db';
import { ForbiddenOperationError } from '../errors';
import { rateProposal } from './rate-proposal.server';

describe('#rateProposal', () => {
  let owner: User, speaker: User;
  let organization: Organization;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    speaker = await userFactory();
    organization = await organizationFactory({ owners: [owner] });
    event = await eventFactory({ organization });
  });
  afterEach(disconnectDB);

  it('adds then updates a rating for a proposal', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    await rateProposal(organization.slug, event.slug, proposal.id, owner.id, {
      feeling: 'NEUTRAL',
      rating: 2,
    });

    const ratings = await db.rating.findMany({ where: { userId: owner.id } });
    expect(ratings.length).toBe(1);

    const rating = ratings[0];
    expect(rating.feeling).toBe('NEUTRAL');
    expect(rating.rating).toBe(2);

    await rateProposal(organization.slug, event.slug, proposal.id, owner.id, {
      feeling: 'POSITIVE',
      rating: 5,
    });

    const updatedRatings = await db.rating.findMany({ where: { userId: owner.id } });
    expect(updatedRatings.length).toBe(1);

    const updatedRating = updatedRatings[0];
    expect(updatedRating.feeling).toBe('POSITIVE');
    expect(updatedRating.rating).toBe(5);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await expect(
      rateProposal(organization.slug, event.slug, proposal.id, user.id, { feeling: 'NEUTRAL', rating: 2 })
    ).rejects.toThrowError(ForbiddenOperationError);
  });
});
