import type { Team, User } from 'prisma/generated/client.ts';
import { CommentChannel } from 'prisma/generated/enums.ts';
import { commentFactory } from 'tests/factories/comments.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ActivityFeed } from './activity-feed.server.ts';

describe('ActivityFeed', () => {
  let owner: User;
  let member1: User;
  let member2: User;
  let speaker: User;
  let team: Team;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    member1 = await userFactory({ traits: ['bruce-wayne'] });
    member2 = await userFactory({ traits: ['peter-parker'] });
    speaker = await userFactory();
    team = await teamFactory({ owners: [owner], members: [member1, member2] });
  });

  describe('#activity', () => {
    it('retrieve all proposals reviews and comments', async () => {
      const event = await eventFactory({ team });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const message1 = await commentFactory({ proposal, user: owner, traits: ['withReaction'] });
      const review1 = await reviewFactory({ proposal, user: owner, attributes: { feeling: 'NEUTRAL', note: 3 } });
      const message2 = await commentFactory({ proposal, user: member1 });
      const review2 = await reviewFactory({ proposal, user: member1, attributes: { feeling: 'POSITIVE', note: 4 } });

      await commentFactory({ proposal, user: member1, attributes: { channel: CommentChannel.SPEAKER } });

      const activity = await ActivityFeed.for(owner.id, team.slug, event.slug, proposal.id).activity();

      expect(activity).toEqual([
        {
          id: message1.id,
          type: 'comment',
          userId: owner.id,
          timestamp: message1.updatedAt,
          comment: message1.comment,
          feeling: null,
          note: null,
          user: owner.name,
          picture: owner.picture,
          reactions: [{ code: 'tada', reacted: true, reactedBy: [{ userId: owner.id, name: 'Clark Kent' }] }],
        },
        {
          id: review1.id,
          type: 'review',
          userId: owner.id,
          timestamp: review1.updatedAt,
          comment: null,
          feeling: review1.feeling,
          note: review1.note,
          user: owner.name,
          picture: owner.picture,
        },
        {
          id: message2.id,
          type: 'comment',
          userId: member1.id,
          timestamp: message2.updatedAt,
          comment: message2.comment,
          feeling: null,
          note: null,
          user: member1.name,
          picture: member1.picture,
          reactions: [],
        },
        {
          id: review2.id,
          type: 'review',
          userId: member1.id,
          timestamp: review2.updatedAt,
          comment: null,
          feeling: review2.feeling,
          note: review2.note,
          user: member1.name,
          picture: member1.picture,
        },
      ]);
    });

    it('retrieves only comments when reviews display is disabled', async () => {
      const event = await eventFactory({ team, attributes: { displayProposalsReviews: false } });
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const message = await commentFactory({ proposal, user: owner });
      await reviewFactory({ proposal, user: owner, attributes: { feeling: 'NEUTRAL', note: 3 } });

      const activity = await ActivityFeed.for(owner.id, team.slug, event.slug, proposal.id).activity();

      expect(activity).toEqual([
        {
          id: message.id,
          type: 'comment',
          userId: owner.id,
          timestamp: message.updatedAt,
          comment: message.comment,
          feeling: null,
          note: null,
          user: owner.name,
          picture: owner.picture,
          reactions: [],
        },
      ]);
    });
  });
});
