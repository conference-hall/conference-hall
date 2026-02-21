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
import { ConversationContextType, ConversationParticipantRole } from '../../../../prisma/generated/client.ts';
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
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await ProposalConversationForOrganizers.for(authorizedEvent, proposal.id).saveMessage({
        message: 'Hello speaker!',
      });

      const conversation = await db.conversation.findFirst({
        where: { eventId: event.id, contextType: ConversationContextType.PROPOSAL_CONVERSATION },
        include: { messages: true },
      });

      expect(conversation?.messages.length).toBe(1);
      expect(conversation?.messages[0].content).toBe('Hello speaker!');
    });

    it('allows owner to update any message', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: member,
        role: ConversationParticipantRole.ORGANIZER,
        attributes: { content: 'Original message' },
      });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await ProposalConversationForOrganizers.for(authorizedEvent, proposal.id).saveMessage({
        id: message.id,
        message: 'Updated by owner',
      });

      const updatedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
      expect(updatedMessage?.content).toBe('Updated by owner');
    });

    it('prevents member from updating other member messages', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: owner,
        role: ConversationParticipantRole.ORGANIZER,
        attributes: { content: 'Original message' },
      });
      const authorizedTeam = await getAuthorizedTeam(member.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const service = ProposalConversationForOrganizers.for(authorizedEvent, proposal.id);

      await service.saveMessage({ id: message.id, message: 'Attempted update' });

      const result = await db.conversationMessage.findUnique({ where: { id: message.id } });
      expect(result?.content).toBe('Original message');
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
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await ProposalConversationForOrganizers.for(authorizedEvent, proposal.id).reactMessage({
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
    it('deletes message from proposal conversation', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: owner,
        role: ConversationParticipantRole.ORGANIZER,
      });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await ProposalConversationForOrganizers.for(authorizedEvent, proposal.id).deleteMessage({
        id: message.id,
      });

      const deletedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
      expect(deletedMessage).toBeNull();
    });

    it('allows owner to delete any message', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: member,
        role: ConversationParticipantRole.ORGANIZER,
      });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await ProposalConversationForOrganizers.for(authorizedEvent, proposal.id).deleteMessage({
        id: message.id,
      });

      const deletedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
      expect(deletedMessage).toBeNull();
    });

    it('prevents member from deleting other member messages', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: owner,
        role: ConversationParticipantRole.ORGANIZER,
      });
      const authorizedTeam = await getAuthorizedTeam(member.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const service = ProposalConversationForOrganizers.for(authorizedEvent, proposal.id);
      await service.deleteMessage({ id: message.id });

      const result = await db.conversationMessage.findUnique({ where: { id: message.id } });
      expect(result).toBeDefined();
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
      const authorizedTeam = await getAuthorizedTeam(member.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const messages = await ProposalConversationForOrganizers.for(authorizedEvent, proposal.id).getConversation();

      expect(messages.length).toBe(1);
      expect(messages[0].content).toBe('Message from organizer');
    });

    it('throws error when proposal does not belong to event', async () => {
      const otherEvent = await eventFactory({ team });
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event: otherEvent, talk });
      const authorizedTeam = await getAuthorizedTeam(member.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const service = ProposalConversationForOrganizers.for(authorizedEvent, proposal.id);

      await expect(service.getConversation()).rejects.toThrowError(ProposalNotFoundError);
    });
  });
});
