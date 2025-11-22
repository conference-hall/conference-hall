import { db } from 'prisma/db.server.ts';
import type { Event, Team, User } from 'prisma/generated/client.ts';
import { ConversationContextType, ConversationParticipantRole } from 'prisma/generated/client.ts';
import { conversationMessageFactory } from 'tests/factories/conversation-messages.ts';
import { conversationFactory } from 'tests/factories/conversations.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ConversationService } from './conversation-service.server.ts';
import { notifyConversationMessage } from './jobs/notify-conversation-message.job.ts';

describe('ConversationService', () => {
  let speaker: User;
  let organizer: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01'));

    speaker = await userFactory({ traits: ['clark-kent'] });
    organizer = await userFactory({ traits: ['bruce-wayne'] });
    team = await teamFactory({ owners: [organizer] });
    event = await eventFactory({ team });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('#saveMessage', () => {
    it('creates conversation and message when conversation does not exist', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      const service = new ConversationService({
        userId: speaker.id,
        role: 'SPEAKER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      await service.saveMessage(event.id, { message: 'Hello organizers!' });

      const conversation = await db.conversation.findFirst({
        where: { eventId: event.id, contextType: ConversationContextType.PROPOSAL_CONVERSATION },
        include: { messages: true },
      });

      expect(conversation?.messages.length).toBe(1);
      expect(conversation?.messages[0].content).toBe('Hello organizers!');
      expect(conversation?.messages[0].senderId).toBe(speaker.id);
    });

    it('creates participant when saving message', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      const service = new ConversationService({
        userId: speaker.id,
        role: 'SPEAKER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      await service.saveMessage(event.id, { message: 'Hello!' });

      const participant = await db.conversationParticipant.findFirst({
        where: { userId: speaker.id },
      });

      expect(participant?.role).toBe(ConversationParticipantRole.SPEAKER);
    });

    it('updates existing message when id is provided', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: speaker,
        role: ConversationParticipantRole.SPEAKER,
      });

      const service = new ConversationService({
        userId: speaker.id,
        role: 'SPEAKER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      await service.saveMessage(event.id, { id: message.id, message: 'Updated message' });

      const updatedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
      expect(updatedMessage?.content).toBe('Updated message');
    });

    it('adds message to existing conversation', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      await conversationMessageFactory({
        conversation,
        sender: organizer,
        role: ConversationParticipantRole.ORGANIZER,
      });

      const service = new ConversationService({
        userId: speaker.id,
        role: 'SPEAKER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      await service.saveMessage(event.id, { message: 'Second message' });

      const messages = await db.conversationMessage.findMany({ where: { conversationId: conversation.id } });
      expect(messages.length).toBe(2);
    });

    it('allows user with canManageConversations to update any message', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: speaker,
        role: ConversationParticipantRole.SPEAKER,
        attributes: { content: 'Original message' },
      });

      const service = new ConversationService({
        userId: organizer.id,
        role: 'ORGANIZER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      await service.saveMessage(event.id, { id: message.id, message: 'Updated by organizer' }, true);

      const updatedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
      expect(updatedMessage?.content).toBe('Updated by organizer');
    });

    it('prevents user without canManageConversations from updating other user messages', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: organizer,
        role: ConversationParticipantRole.ORGANIZER,
        attributes: { content: 'Original message' },
      });

      const service = new ConversationService({
        userId: speaker.id,
        role: 'SPEAKER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      await service.saveMessage(event.id, { id: message.id, message: 'Attempted update' }, false);

      const result = await db.conversationMessage.findUnique({ where: { id: message.id } });
      expect(result?.content).toBe('Original message');
    });

    it('triggers notification job when creating a new message', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      const service = new ConversationService({
        userId: speaker.id,
        role: 'SPEAKER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      await service.saveMessage(event.id, { message: 'New message' });

      const conversation = await db.conversation.findFirst({
        where: { eventId: event.id, contextType: ConversationContextType.PROPOSAL_CONVERSATION },
      });

      expect(notifyConversationMessage.trigger).toHaveBeenCalledWith(
        { conversationId: conversation?.id },
        expect.objectContaining({
          delay: expect.any(Number),
          deduplication: expect.objectContaining({
            id: conversation?.id,
            ttl: expect.any(Number),
            extend: true,
            replace: true,
          }),
        }),
      );
    });

    it('does not trigger notification job when updating an existing message', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: speaker,
        role: ConversationParticipantRole.SPEAKER,
      });

      const service = new ConversationService({
        userId: speaker.id,
        role: 'SPEAKER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      await service.saveMessage(event.id, { id: message.id, message: 'Updated message' });

      expect(notifyConversationMessage.trigger).not.toHaveBeenCalled();
    });
  });

  describe('#reactMessage', () => {
    it('creates reaction on message', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: organizer,
        role: ConversationParticipantRole.ORGANIZER,
      });

      const service = new ConversationService({
        userId: speaker.id,
        role: 'SPEAKER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      await service.reactMessage({ id: message.id, code: 'tada' });

      const reaction = await db.conversationReaction.findUnique({
        where: { messageId_userId_code: { messageId: message.id, userId: speaker.id, code: 'tada' } },
      });
      expect(reaction).toBeDefined();
    });

    it('deletes reaction when reaction already exists', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: organizer,
        role: ConversationParticipantRole.ORGANIZER,
        traits: ['withReaction'],
      });

      const service = new ConversationService({
        userId: organizer.id,
        role: 'ORGANIZER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      await service.reactMessage({ id: message.id, code: 'tada' });

      const reaction = await db.conversationReaction.findUnique({
        where: { messageId_userId_code: { messageId: message.id, userId: organizer.id, code: 'tada' } },
      });
      expect(reaction).toBeNull();
    });
  });

  describe('#deleteMessage', () => {
    it('deletes message', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: speaker,
        role: ConversationParticipantRole.SPEAKER,
      });

      const service = new ConversationService({
        userId: speaker.id,
        role: 'SPEAKER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      await service.deleteMessage({ id: message.id });

      const deletedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
      expect(deletedMessage).toBeNull();
    });

    it('allows user with canManageConversations to delete any message', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: speaker,
        role: ConversationParticipantRole.SPEAKER,
      });

      const service = new ConversationService({
        userId: organizer.id,
        role: 'ORGANIZER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      await service.deleteMessage({ id: message.id }, true);

      const deletedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
      expect(deletedMessage).toBeNull();
    });

    it('prevents user without canManageConversations from deleting other user messages', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: organizer,
        role: ConversationParticipantRole.ORGANIZER,
      });

      const service = new ConversationService({
        userId: speaker.id,
        role: 'SPEAKER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      await service.deleteMessage({ id: message.id }, false);

      const result = await db.conversationMessage.findUnique({ where: { id: message.id } });
      expect(result).toBeDefined();
    });
  });

  describe('#getConversation', () => {
    it('returns empty array when conversation does not exist', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      const service = new ConversationService({
        userId: speaker.id,
        role: 'SPEAKER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      const messages = await service.getConversation(event.id);
      expect(messages).toEqual([]);
    });

    it('returns empty array when conversation disabled on event', async () => {
      const eventWithoutConversation = await eventFactory({ team, attributes: { speakersConversationEnabled: false } });
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event: eventWithoutConversation, talk });
      const conversation = await conversationFactory({ event: eventWithoutConversation, proposalId: proposal.id });
      await conversationMessageFactory({
        conversation,
        sender: speaker,
        role: ConversationParticipantRole.SPEAKER,
        traits: ['withReaction'],
      });

      const service = new ConversationService({
        userId: speaker.id,
        role: 'SPEAKER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      const messages = await service.getConversation(eventWithoutConversation.id);
      expect(messages).toEqual([]);
    });

    it('returns messages with sender and reactions', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: speaker,
        role: ConversationParticipantRole.SPEAKER,
        traits: ['withReaction'],
      });

      const service = new ConversationService({
        userId: speaker.id,
        role: 'SPEAKER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      const messages = await service.getConversation(event.id);

      expect(messages.length).toBe(1);
      expect(messages[0].id).toBe(message.id);
      expect(messages[0].sender.name).toBe('Clark Kent');
      expect(messages[0].sender.role).toBe(ConversationParticipantRole.SPEAKER);
      expect(messages[0].reactions).toEqual([
        { code: 'tada', reacted: true, reactedBy: [{ userId: speaker.id, name: 'Clark Kent' }] },
      ]);
    });

    it('returns messages ordered by creation date descending', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });

      await conversationMessageFactory({
        conversation,
        sender: speaker,
        role: ConversationParticipantRole.SPEAKER,
        attributes: { content: 'First message', createdAt: new Date('2023-01-01T10:00:00Z') },
      });

      await conversationMessageFactory({
        conversation,
        sender: organizer,
        role: ConversationParticipantRole.ORGANIZER,
        attributes: { content: 'Second message', createdAt: new Date('2023-01-01T11:00:00Z') },
      });

      const service = new ConversationService({
        userId: speaker.id,
        role: 'SPEAKER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      const messages = await service.getConversation(event.id);

      expect(messages.length).toBe(2);
      expect(messages[0].content).toBe('First message');
      expect(messages[1].content).toBe('Second message');
    });

    it('marks reactions as reacted for current user', async () => {
      const otherUser = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: speaker,
        role: ConversationParticipantRole.SPEAKER,
      });

      await db.conversationReaction.createMany({
        data: [
          { messageId: message.id, userId: speaker.id, code: 'tada' },
          { messageId: message.id, userId: otherUser.id, code: 'tada' },
        ],
      });

      const service = new ConversationService({
        userId: speaker.id,
        role: 'SPEAKER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      const messages = await service.getConversation(event.id);

      expect(messages[0].reactions[0].reacted).toBe(true);
      expect(messages[0].reactions[0].reactedBy.length).toBe(2);
    });

    it('sorts reactions by earliest reaction date', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: speaker,
        role: ConversationParticipantRole.SPEAKER,
      });

      await db.conversationReaction.createMany({
        data: [
          { messageId: message.id, userId: speaker.id, code: 'heart', reactedAt: new Date('2023-01-01T12:00:00Z') },
          { messageId: message.id, userId: speaker.id, code: 'tada', reactedAt: new Date('2023-01-01T10:00:00Z') },
        ],
      });

      const service = new ConversationService({
        userId: speaker.id,
        role: 'SPEAKER',
        contextType: ConversationContextType.PROPOSAL_CONVERSATION,
        contextIds: [proposal.id],
      });

      const messages = await service.getConversation(event.id);

      expect(messages[0].reactions[0].code).toBe('tada');
      expect(messages[0].reactions[1].code).toBe('heart');
    });
  });
});
