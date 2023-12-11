import type { Event, Team, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { messageFactory } from 'tests/factories/messages.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ActivityFeed } from './ActivityFeed.ts';

describe('ActivityFeed', () => {
  let owner: User, member: User, speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory();
    team = await teamFactory({ owners: [owner], members: [member] });
    event = await eventFactory({ team });
  });

  describe('#messages', () => {
    it('retrieve proposals messages', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const message1 = await messageFactory({ proposal, user: owner, attributes: { message: 'Message 1' } });
      const review1 = await reviewFactory({ proposal, user: owner, attributes: { feeling: 'NEUTRAL', note: 3 } });
      const message2 = await messageFactory({ proposal, user: member, attributes: { message: 'Message 2' } });
      const review2 = await reviewFactory({ proposal, user: member, attributes: { feeling: 'POSITIVE', note: 4 } });

      const activity = await new ActivityFeed(proposal.id).activity();

      expect(activity).toEqual([
        {
          id: message1.id,
          type: 'comment',
          userId: owner.id,
          timestamp: message1.updatedAt.toUTCString(),
          comment: message1.message,
          feeling: null,
          note: null,
          user: owner.name,
          picture: owner.picture,
        },
        {
          id: review1.id,
          type: 'review',
          userId: owner.id,
          timestamp: review1.updatedAt.toUTCString(),
          comment: null,
          feeling: review1.feeling,
          note: review1.note,
          user: owner.name,
          picture: owner.picture,
        },
        {
          id: message2.id,
          type: 'comment',
          userId: member.id,
          timestamp: message2.updatedAt.toUTCString(),
          comment: message2.message,
          feeling: null,
          note: null,
          user: member.name,
          picture: member.picture,
        },
        {
          id: review2.id,
          type: 'review',
          userId: member.id,
          timestamp: review2.updatedAt.toUTCString(),
          comment: null,
          feeling: review2.feeling,
          note: review2.note,
          user: member.name,
          picture: member.picture,
        },
      ]);
    });
  });
});
