import { db } from 'prisma/db.server.ts';
import type { Event, Team, User } from 'prisma/generated/client.ts';
import { commentFactory } from 'tests/factories/comments.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
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

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      await Comments.for(authorizedEvent, proposal.id).save({ message: 'My message' });

      const messages = await db.comment.findMany({ where: { userId: owner.id, proposalId: proposal.id } });
      expect(messages.length).toBe(1);

      const message = messages[0];
      expect(message.comment).toBe('My message');
      expect(message.channel).toBe('ORGANIZER');
    });

    it('allows owner to update any comment', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const comment = await commentFactory({ user: member, proposal, attributes: { comment: 'Original comment' } });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      await Comments.for(authorizedEvent, proposal.id).save({
        id: comment.id,
        message: 'Updated by owner',
      });

      const updatedComment = await db.comment.findUnique({ where: { id: comment.id } });
      expect(updatedComment?.comment).toBe('Updated by owner');
    });

    it('prevents member from updating other member comments', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const comment = await commentFactory({ user: owner, proposal, attributes: { comment: 'Original comment' } });

      const authorizedTeam = await getAuthorizedTeam(member.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      await Comments.for(authorizedEvent, proposal.id).save({
        id: comment.id,
        message: 'Attempted update',
      });

      const result = await db.comment.findUnique({ where: { id: comment.id } });
      expect(result?.comment).toBe('Original comment');
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      await expect(async () => {
        const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const discussion = Comments.for(authorizedEvent, proposal.id);
        await discussion.save({ message: 'My message' });
      }).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#remove', () => {
    it('removes a comment from a proposal', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const message = await commentFactory({ user: owner, proposal });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      await Comments.for(authorizedEvent, proposal.id).remove(message.id);

      const messages = await db.comment.findMany({ where: { userId: owner.id, proposalId: proposal.id } });
      expect(messages.length).toBe(0);
    });

    it('allows owner to remove any comment', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const message = await commentFactory({ user: member, proposal });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      await Comments.for(authorizedEvent, proposal.id).remove(message.id);

      const messages = await db.comment.findMany({ where: { userId: member.id, proposalId: proposal.id } });
      expect(messages.length).toBe(0);
    });

    it('prevents member from removing other member comments', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const message = await commentFactory({ user: owner, proposal });

      const authorizedTeam = await getAuthorizedTeam(member.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      await Comments.for(authorizedEvent, proposal.id).remove(message.id);

      const result = await db.comment.findUnique({ where: { id: message.id } });
      expect(result).toBeDefined();
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const message = await commentFactory({ user, proposal });
      await expect(async () => {
        const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
        const discussion = Comments.for(authorizedEvent, proposal.id);
        await discussion.remove(message.id);
      }).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#reactToComment', () => {
    it('adds a reaction to a comment', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const message = await commentFactory({ user: owner, proposal });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      await Comments.for(authorizedEvent, proposal.id).reactToComment({
        id: message.id,
        code: 'tada',
      });

      const reactions = await Comments.listReactions([message.id], owner.id);
      expect(reactions[message.id]).toEqual([
        { code: 'tada', reacted: true, reactedBy: [{ userId: owner.id, name: 'Clark Kent' }] },
      ]);
    });

    it('removes a reaction to a comment', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const message = await commentFactory({ user: owner, proposal, traits: ['withReaction'] });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      await Comments.for(authorizedEvent, proposal.id).reactToComment({
        id: message.id,
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
        [message1.id]: [{ code: 'tada', reacted: true, reactedBy: [{ userId: owner.id, name: 'Clark Kent' }] }],
        [message2.id]: [{ code: 'tada', reacted: false, reactedBy: [{ userId: member.id, name: member.name }] }],
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
