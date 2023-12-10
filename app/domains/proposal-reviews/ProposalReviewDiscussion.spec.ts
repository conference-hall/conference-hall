import type { Event, Team, User } from '@prisma/client';
import { MessageChannel } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { messageFactory } from 'tests/factories/messages.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.ts';
import { ForbiddenOperationError } from '~/libs/errors.ts';

import { ProposalReviewDiscussion } from './ProposalReviewDiscussion.ts';

describe('ProposalReviewDiscussion', () => {
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
      const message2 = await messageFactory({ proposal, user: member, attributes: { message: 'Message 2' } });

      const messages = await ProposalReviewDiscussion.for(owner.id, team.slug, event.slug, proposal.id).messages();

      expect(messages).toEqual([
        {
          id: message2.id,
          userId: member.id,
          name: member.name,
          picture: member.picture,
          message: 'Message 2',
        },
        {
          id: message1.id,
          userId: owner.id,
          name: owner.name,
          picture: owner.picture,
          message: 'Message 1',
        },
      ]);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const discussion = ProposalReviewDiscussion.for(user.id, team.slug, event.slug, proposal.id);
      await expect(discussion.messages()).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#add', () => {
    it('adds message to a proposal', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      await ProposalReviewDiscussion.for(owner.id, team.slug, event.slug, proposal.id).add('My message');

      const messages = await db.message.findMany({ where: { userId: owner.id, proposalId: proposal.id } });
      expect(messages.length).toBe(1);

      const message = messages[0];
      expect(message.message).toBe('My message');
      expect(message.channel).toBe(MessageChannel.ORGANIZER);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const discussion = ProposalReviewDiscussion.for(user.id, team.slug, event.slug, proposal.id);
      await expect(discussion.add('My message')).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#remove', () => {
    it('removes a message from a proposal', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const message = await messageFactory({ user: owner, proposal });

      await ProposalReviewDiscussion.for(owner.id, team.slug, event.slug, proposal.id).remove(message.id);

      const messages = await db.message.findMany({ where: { userId: owner.id, proposalId: proposal.id } });
      expect(messages.length).toBe(0);
    });

    it('removes a message from a proposal only if it belongs to the user', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const message = await messageFactory({ user: member, proposal });

      await ProposalReviewDiscussion.for(owner.id, team.slug, event.slug, proposal.id).remove(message.id);

      const messages = await db.message.findMany({ where: { userId: member.id, proposalId: proposal.id } });
      expect(messages.length).toBe(1);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const message = await messageFactory({ user, proposal });
      const discussion = ProposalReviewDiscussion.for(user.id, team.slug, event.slug, proposal.id);
      await expect(discussion.remove(message.id)).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
