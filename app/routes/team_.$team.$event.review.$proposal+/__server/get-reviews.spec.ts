import type { Event, Team, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { reviewFactory } from 'tests/factories/reviews';
import { talkFactory } from 'tests/factories/talks';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';

import { db } from '~/libs/db';
import { ForbiddenOperationError } from '~/libs/errors';

import { getReviews } from './get-reviews.server';

describe('#getReviews', () => {
  let owner: User, member: User, speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner, member] });
    event = await eventFactory({ team });
  });

  it('returns proposal reviews', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await reviewFactory({ proposal, user: owner, attributes: { feeling: 'NEGATIVE', note: 0 } });
    await reviewFactory({ proposal, user: member, attributes: { feeling: 'POSITIVE', note: 5, comment: 'Yeah!' } });

    const reviews = await getReviews(event.slug, proposal.id, owner.id);

    expect(reviews).toEqual([
      { feeling: 'POSITIVE', id: member.id, name: member.name, picture: member.picture, note: 5, comment: 'Yeah!' },
      { feeling: 'NEGATIVE', id: owner.id, name: owner.name, picture: owner.picture, note: 0, comment: null },
    ]);
  });

  it('throws an error if display of reviews is disabled for the event', async () => {
    await db.event.update({ data: { displayProposalsReviews: false }, where: { id: event.id } });
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    await expect(getReviews(event.slug, proposal.id, owner.id)).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if user does not belong to event team', async () => {
    const user = await userFactory();
    const event = await eventFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });
    await expect(getReviews(event.slug, proposal.id, user.id)).rejects.toThrowError(ForbiddenOperationError);
  });
});
