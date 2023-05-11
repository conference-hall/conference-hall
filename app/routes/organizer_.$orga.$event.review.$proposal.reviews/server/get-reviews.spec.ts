import type { Event, Organization, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { organizationFactory } from 'tests/factories/organization';
import { proposalFactory } from 'tests/factories/proposals';
import { ratingFactory } from 'tests/factories/ratings';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { ForbiddenOperationError } from '~/libs/errors';
import { db } from '~/libs/db';
import { getReviews } from './get-reviews.server';

describe('#getReviews', () => {
  let owner: User, member: User, speaker: User;
  let organization: Organization;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    organization = await organizationFactory({ owners: [owner, member] });
    event = await eventFactory({ organization });
  });
  afterEach(disconnectDB);

  it('returns proposal reviews', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await ratingFactory({ proposal, user: owner, attributes: { feeling: 'NEGATIVE', rating: 0 } });
    await ratingFactory({ proposal, user: member, attributes: { feeling: 'POSITIVE', rating: 5, comment: 'Yeah!' } });

    const reviews = await getReviews(event.slug, proposal.id, owner.id);

    expect(reviews).toEqual([
      { feeling: 'POSITIVE', id: member.id, name: member.name, picture: member.picture, rating: 5, comment: 'Yeah!' },
      { feeling: 'NEGATIVE', id: owner.id, name: owner.name, picture: owner.picture, rating: 0, comment: null },
    ]);
  });

  it('throws an error if display of reviews is disabled for the event', async () => {
    await db.event.update({ data: { displayProposalsRatings: false }, where: { id: event.id } });
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    await expect(getReviews(event.slug, proposal.id, owner.id)).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const event = await eventFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });
    await expect(getReviews(event.slug, proposal.id, user.id)).rejects.toThrowError(ForbiddenOperationError);
  });
});
