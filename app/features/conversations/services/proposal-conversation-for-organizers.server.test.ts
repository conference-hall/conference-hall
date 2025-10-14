import { db } from 'prisma/db.server.ts';
import type { Event, Team, User } from 'prisma/generated/client.ts';
import { ConversationContextType, ConversationParticipantRole } from 'prisma/generated/enums.ts';
import { conversationMessageFactory } from 'tests/factories/conversation-messages.ts';
import { conversationFactory } from 'tests/factories/conversations.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ForbiddenOperationError, ProposalNotFoundError } from '~/shared/errors.server.ts';

import { ProposalConversationForOrganizers } from './proposal-conversation-for-organizers.server.ts';

describe('ProposalConversationForOrganizers', () => {
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
    it('saves message to proposal conversation', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      await ProposalConversationForOrganizers.for(owner.id, team.slug, event.slug, proposal.id).saveMessage({
        message: 'Hello speaker!',
      });

      const conversation = await db.conversation.findFirst({
        where: { eventId: event.id, contextType: ConversationContextType.PROPOSAL_CONVERSATION },
        include: { messages: true },
      });

      expect(conversation?.messages.length).toBe(1);
      expect(conversation?.messages[0].content).toBe('Hello speaker!');
    });

    it('throws error when user does not belong to team', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const otherUser = await userFactory();

      const service = ProposalConversationForOrganizers.for(otherUser.id, team.slug, event.slug, proposal.id);

      await expect(service.saveMessage({ message: 'Hello!' })).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#reactMessage', () => {
    it('reacts to message in proposal conversation', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: speaker,
        role: ConversationParticipantRole.SPEAKER,
      });

      await ProposalConversationForOrganizers.for(owner.id, team.slug, event.slug, proposal.id).reactMessage({
        id: message.id,
        code: 'tada',
      });

      const reaction = await db.conversationReaction.findUnique({
        where: { messageId_userId_code: { messageId: message.id, userId: owner.id, code: 'tada' } },
      });
      expect(reaction).toBeDefined();
    });

    it('throws error when user does not belong to team', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: speaker,
        role: ConversationParticipantRole.SPEAKER,
      });
      const otherUser = await userFactory();

      const service = ProposalConversationForOrganizers.for(otherUser.id, team.slug, event.slug, proposal.id);

      await expect(service.reactMessage({ id: message.id, code: 'tada' })).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });

  describe('#deleteMessage', () => {
    it('deletes message from proposal conversation', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: owner,
        role: ConversationParticipantRole.ORGANIZER,
      });

      await ProposalConversationForOrganizers.for(owner.id, team.slug, event.slug, proposal.id).deleteMessage({
        id: message.id,
      });

      const deletedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
      expect(deletedMessage).toBeNull();
    });

    it('throws error when user does not belong to team', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: owner,
        role: ConversationParticipantRole.ORGANIZER,
      });
      const otherUser = await userFactory();

      const service = ProposalConversationForOrganizers.for(otherUser.id, team.slug, event.slug, proposal.id);

      await expect(service.deleteMessage({ id: message.id })).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#getConversation', () => {
    it('returns conversation messages for proposal', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      await conversationMessageFactory({
        conversation,
        sender: owner,
        role: ConversationParticipantRole.ORGANIZER,
        attributes: { content: 'Message from organizer' },
      });

      const messages = await ProposalConversationForOrganizers.for(
        owner.id,
        team.slug,
        event.slug,
        proposal.id,
      ).getConversation();

      expect(messages.length).toBe(1);
      expect(messages[0].content).toBe('Message from organizer');
    });

    it('throws error when proposal does not belong to event', async () => {
      const otherEvent = await eventFactory({ team });
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event: otherEvent, talk });

      const service = ProposalConversationForOrganizers.for(owner.id, team.slug, event.slug, proposal.id);

      await expect(service.getConversation()).rejects.toThrowError(ProposalNotFoundError);
    });

    it('throws error when user does not belong to team', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const otherUser = await userFactory();

      const service = ProposalConversationForOrganizers.for(otherUser.id, team.slug, event.slug, proposal.id);

      await expect(service.getConversation()).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
