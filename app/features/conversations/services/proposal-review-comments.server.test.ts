import { conversationMessageFactory } from 'tests/factories/conversation-messages.ts';
import { conversationFactory } from 'tests/factories/conversations.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { ProposalNotFoundError } from '~/shared/errors.server.ts';
import { db } from '../../../../prisma/db.server.ts';
import type { Event, Team, User } from '../../../../prisma/generated/client.ts';
import { ConversationType, ConversationParticipantRole } from '../../../../prisma/generated/client.ts';
import { ProposalReviewComments } from './proposal-review-comments.server.ts';

describe('ProposalReviewComments', () => {
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

  describe('#saveMessage', () => {
    it('saves message to review comments conversation', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await ProposalReviewComments.for(authorizedEvent, proposal.id).saveMessage({
        message: 'Review comment!',
      });

      const conversation = await db.conversation.findFirst({
        where: { eventId: event.id, type: ConversationType.PROPOSAL_REVIEW_COMMENTS },
        include: { messages: true },
      });

      expect(conversation?.messages.length).toBe(1);
      expect(conversation?.messages[0].content).toBe('Review comment!');
    });

    it('allows owner to update any message', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({
        event,
        proposalId: proposal.id,
        attributes: { type: ConversationType.PROPOSAL_REVIEW_COMMENTS },
      });
      const message = await conversationMessageFactory({
        conversation,
        sender: member,
        role: ConversationParticipantRole.ORGANIZER,
        attributes: { content: 'Original message' },
      });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await ProposalReviewComments.for(authorizedEvent, proposal.id).saveMessage({
        id: message.id,
        message: 'Updated by owner',
      });

      const updatedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
      expect(updatedMessage?.content).toBe('Updated by owner');
    });

    it('prevents member from updating other member messages', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({
        event,
        proposalId: proposal.id,
        attributes: { type: ConversationType.PROPOSAL_REVIEW_COMMENTS },
      });
      const message = await conversationMessageFactory({
        conversation,
        sender: owner,
        role: ConversationParticipantRole.ORGANIZER,
        attributes: { content: 'Original message' },
      });
      const authorizedTeam = await getAuthorizedTeam(member.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await ProposalReviewComments.for(authorizedEvent, proposal.id).saveMessage({
        id: message.id,
        message: 'Attempted update',
      });

      const result = await db.conversationMessage.findUnique({ where: { id: message.id } });
      expect(result?.content).toBe('Original message');
    });

    it('throws error when proposal does not belong to event', async () => {
      const otherEvent = await eventFactory({ team });
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event: otherEvent, talk });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const service = ProposalReviewComments.for(authorizedEvent, proposal.id);

      await expect(service.saveMessage({ message: 'Should fail' })).rejects.toThrowError(ProposalNotFoundError);
    });
  });

  describe('#reactMessage', () => {
    it('reacts to message in review comments conversation', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({
        event,
        proposalId: proposal.id,
        attributes: { type: ConversationType.PROPOSAL_REVIEW_COMMENTS },
      });
      const message = await conversationMessageFactory({
        conversation,
        sender: member,
        role: ConversationParticipantRole.ORGANIZER,
      });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await ProposalReviewComments.for(authorizedEvent, proposal.id).reactMessage({
        id: message.id,
        code: 'tada',
      });

      const reaction = await db.conversationReaction.findUnique({
        where: { messageId_userId_code: { messageId: message.id, userId: owner.id, code: 'tada' } },
      });
      expect(reaction).toBeDefined();
    });
  });

  describe('#deleteMessage', () => {
    it('deletes own message', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({
        event,
        proposalId: proposal.id,
        attributes: { type: ConversationType.PROPOSAL_REVIEW_COMMENTS },
      });
      const message = await conversationMessageFactory({
        conversation,
        sender: owner,
        role: ConversationParticipantRole.ORGANIZER,
      });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await ProposalReviewComments.for(authorizedEvent, proposal.id).deleteMessage({ id: message.id });

      const deletedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
      expect(deletedMessage).toBeNull();
    });

    it('allows owner to delete any message', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({
        event,
        proposalId: proposal.id,
        attributes: { type: ConversationType.PROPOSAL_REVIEW_COMMENTS },
      });
      const message = await conversationMessageFactory({
        conversation,
        sender: member,
        role: ConversationParticipantRole.ORGANIZER,
      });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await ProposalReviewComments.for(authorizedEvent, proposal.id).deleteMessage({ id: message.id });

      const deletedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
      expect(deletedMessage).toBeNull();
    });

    it('prevents member from deleting other member messages', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({
        event,
        proposalId: proposal.id,
        attributes: { type: ConversationType.PROPOSAL_REVIEW_COMMENTS },
      });
      const message = await conversationMessageFactory({
        conversation,
        sender: owner,
        role: ConversationParticipantRole.ORGANIZER,
      });
      const authorizedTeam = await getAuthorizedTeam(member.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await ProposalReviewComments.for(authorizedEvent, proposal.id).deleteMessage({ id: message.id });

      const result = await db.conversationMessage.findUnique({ where: { id: message.id } });
      expect(result).toBeDefined();
    });
  });

  describe('#getConversation', () => {
    it('returns conversation messages for proposal', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({
        event,
        proposalId: proposal.id,
        attributes: { type: ConversationType.PROPOSAL_REVIEW_COMMENTS },
      });
      await conversationMessageFactory({
        conversation,
        sender: owner,
        role: ConversationParticipantRole.ORGANIZER,
        attributes: { content: 'Review note' },
      });
      const authorizedTeam = await getAuthorizedTeam(member.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const messages = await ProposalReviewComments.for(authorizedEvent, proposal.id).getConversation();

      expect(messages.length).toBe(1);
      expect(messages[0].content).toBe('Review note');
    });

    it('throws error when proposal does not belong to event', async () => {
      const otherEvent = await eventFactory({ team });
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event: otherEvent, talk });
      const authorizedTeam = await getAuthorizedTeam(member.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const service = ProposalReviewComments.for(authorizedEvent, proposal.id);

      await expect(service.getConversation()).rejects.toThrowError(ProposalNotFoundError);
    });
  });
});
