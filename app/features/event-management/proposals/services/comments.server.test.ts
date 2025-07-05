import type { Event, Team, User } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { commentFactory } from 'tests/factories/comments.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ForbiddenOperationError } from '~/shared/errors.server.ts';

import { Comments } from './comments.server.ts';

describe('Comments', () => {
  let owner: User;
  let member: User;
  let speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory();
    team = await teamFactory({ owners: [owner], members: [member] });
    event = await eventFactory({ team });
  });

  describe('#add', () => {
    it('adds comment to a proposal', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      await Comments.for(owner.id, team.slug, event.slug, proposal.id).add('My message');

      const messages = await db.comment.findMany({ where: { userId: owner.id, proposalId: proposal.id } });
      expect(messages.length).toBe(1);

      const message = messages[0];
      expect(message.comment).toBe('My message');
      expect(message.channel).toBe('ORGANIZER');
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const discussion = Comments.for(user.id, team.slug, event.slug, proposal.id);
      await expect(discussion.add('My message')).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#remove', () => {
    it('removes a comment from a proposal', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const message = await commentFactory({ user: owner, proposal });

      await Comments.for(owner.id, team.slug, event.slug, proposal.id).remove(message.id);

      const messages = await db.comment.findMany({ where: { userId: owner.id, proposalId: proposal.id } });
      expect(messages.length).toBe(0);
    });

    it('removes a comment from a proposal only if it belongs to the user', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const message = await commentFactory({ user: member, proposal });

      await Comments.for(owner.id, team.slug, event.slug, proposal.id).remove(message.id);

      const messages = await db.comment.findMany({ where: { userId: member.id, proposalId: proposal.id } });
      expect(messages.length).toBe(1);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const message = await commentFactory({ user, proposal });
      const discussion = Comments.for(user.id, team.slug, event.slug, proposal.id);
      await expect(discussion.remove(message.id)).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#reactToComment', () => {
    it('adds a reaction to a comment', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const message = await commentFactory({ user: owner, proposal });

      await Comments.for(owner.id, team.slug, event.slug, proposal.id).reactToComment({
        commentId: message.id,
        code: 'tada',
      });

      const reactions = await Comments.listReactions([message.id], owner.id);
      expect(reactions[message.id]).toEqual([{ code: 'tada', reacted: true, reactedBy: ['You'] }]);
    });

    it('removes a reaction to a comment', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const message = await commentFactory({ user: owner, proposal, traits: ['withReaction'] });

      await Comments.for(owner.id, team.slug, event.slug, proposal.id).reactToComment({
        commentId: message.id,
        code: 'tada',
      });

      const reactions = await Comments.listReactions([message.id], owner.id);
      expect(reactions[message.id]).toEqual([]);
    });
  });

  describe('#Comments.listReactions', () => {
    it('lists comments reactions', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const message1 = await commentFactory({ user: owner, proposal, traits: ['withReaction'] });
      const message2 = await commentFactory({ user: member, proposal, traits: ['withReaction'] });

      const reactions = await Comments.listReactions([message1.id, message2.id], owner.id);
      expect(reactions).toEqual({
        [message1.id]: [{ code: 'tada', reacted: true, reactedBy: ['You'] }],
        [message2.id]: [{ code: 'tada', reacted: false, reactedBy: [member.name] }],
      });
    });

    it('returns an empty object when no comment id given', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      await commentFactory({ user: owner, proposal, traits: ['withReaction'] });

      const reactions = await Comments.listReactions([], owner.id);
      expect(reactions).toEqual({});
    });
  });
});
