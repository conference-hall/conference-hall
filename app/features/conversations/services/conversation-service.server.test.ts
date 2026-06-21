import { conversationMessageFactory } from 'tests/factories/conversation-messages.ts';
import { conversationFactory } from 'tests/factories/conversations.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError, ProposalNotFoundError } from '~/shared/errors.server.ts';
import { db } from '../../../../prisma/db.server.ts';
import type { Event, Team, User } from '../../../../prisma/generated/client.ts';
import { ConversationParticipantRole, ConversationType } from '../../../../prisma/generated/client.ts';
import { ConversationService } from './conversation-service.server.ts';

describe('ConversationService', () => {
  let speaker: User;
  let owner: User;
  let member: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01'));

    speaker = await userFactory({ traits: ['clark-kent'] });
    owner = await userFactory({ traits: ['bruce-wayne'] });
    member = await userFactory();
    team = await teamFactory({ owners: [owner], members: [member] });
    event = await eventFactory({ team });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const authorizeOwner = async (forEvent: Event = event): Promise<AuthorizedEvent> => {
    const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
    return getAuthorizedEvent(authorizedTeam, forEvent.slug);
  };

  const authorizeMember = async (forEvent: Event = event): Promise<AuthorizedEvent> => {
    const authorizedTeam = await getAuthorizedTeam(member.id, team.slug);
    return getAuthorizedEvent(authorizedTeam, forEvent.slug);
  };

  describe('forSpeaker', () => {
    let anotherSpeaker: User;

    beforeEach(async () => {
      anotherSpeaker = await userFactory();
    });

    describe('#saveMessage', () => {
      it('saves message to the speaker conversation', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });

        await ConversationService.forSpeaker(speaker.id, proposal.id).saveMessage({ message: 'Hello organizers!' });

        const conversation = await db.conversation.findFirst({
          where: { eventId: event.id, type: ConversationType.PROPOSAL_SPEAKER_CONVERSATION },
          include: { messages: true },
        });

        expect(conversation?.messages.length).toBe(1);
        expect(conversation?.messages[0].content).toBe('Hello organizers!');
        expect(conversation?.messages[0].senderId).toBe(speaker.id);
      });

      it('throws when the speaker does not belong to the proposal', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });

        const service = ConversationService.forSpeaker(anotherSpeaker.id, proposal.id);

        await expect(service.saveMessage({ message: 'Hello!' })).rejects.toThrow(ProposalNotFoundError);
      });

      it('throws when the proposal does not exist', async () => {
        const service = ConversationService.forSpeaker(speaker.id, 'non-existent');

        await expect(service.saveMessage({ message: 'Hello!' })).rejects.toThrow(ProposalNotFoundError);
      });
    });

    describe('#reactMessage', () => {
      it('reacts to a message in the speaker conversation', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
        });

        await ConversationService.forSpeaker(speaker.id, proposal.id).reactMessage({ id: message.id, code: 'tada' });

        const reaction = await db.conversationReaction.findUnique({
          where: { messageId_userId_code: { messageId: message.id, userId: speaker.id, code: 'tada' } },
        });
        expect(reaction).toBeDefined();
      });

      it('throws when the speaker does not belong to the proposal', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
        });

        const service = ConversationService.forSpeaker(anotherSpeaker.id, proposal.id);

        await expect(service.reactMessage({ id: message.id, code: 'tada' })).rejects.toThrow(ProposalNotFoundError);
      });
    });

    describe('#deleteMessage', () => {
      it('deletes a message from the speaker conversation', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
        });

        await ConversationService.forSpeaker(speaker.id, proposal.id).deleteMessage({ id: message.id });

        const deletedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
        expect(deletedMessage).toBeNull();
      });

      it('throws when the speaker does not belong to the proposal', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
        });

        const service = ConversationService.forSpeaker(anotherSpeaker.id, proposal.id);

        await expect(service.deleteMessage({ id: message.id })).rejects.toThrow(ProposalNotFoundError);
      });
    });

    describe('#getConversation', () => {
      it('returns the conversation messages for the proposal', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
          attributes: { content: 'Message from speaker' },
        });

        const messages = await ConversationService.forSpeaker(speaker.id, proposal.id).getConversation();

        expect(messages.length).toBe(1);
        expect(messages[0].content).toBe('Message from speaker');
      });

      it('throws when the speaker does not belong to the proposal', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });

        const service = ConversationService.forSpeaker(anotherSpeaker.id, proposal.id);

        await expect(service.getConversation()).rejects.toThrow(ProposalNotFoundError);
      });

      it('throws when the proposal does not exist', async () => {
        const service = ConversationService.forSpeaker(speaker.id, 'non-existent');

        await expect(service.getConversation()).rejects.toThrow(ProposalNotFoundError);
      });
    });

    describe('availability gate (speakersConversationEnabled)', () => {
      let disabledEvent: Event;

      beforeEach(async () => {
        disabledEvent = await eventFactory({ team, attributes: { speakersConversationEnabled: false } });
      });

      it('reading returns an empty list when speaker conversations are disabled', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event: disabledEvent, talk });
        const conversation = await conversationFactory({
          event: disabledEvent,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
        });

        const messages = await ConversationService.forSpeaker(speaker.id, proposal.id).getConversation();

        expect(messages).toEqual([]);
      });

      it('posting throws when speaker conversations are disabled', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event: disabledEvent, talk });

        const service = ConversationService.forSpeaker(speaker.id, proposal.id);

        await expect(service.saveMessage({ message: 'Hello!' })).rejects.toThrow(ForbiddenOperationError);
      });

      it('reacting throws when speaker conversations are disabled', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event: disabledEvent, talk });
        const conversation = await conversationFactory({
          event: disabledEvent,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
        });

        const service = ConversationService.forSpeaker(speaker.id, proposal.id);

        await expect(service.reactMessage({ id: message.id, code: 'tada' })).rejects.toThrow(ForbiddenOperationError);
      });

      it('deleting throws when speaker conversations are disabled', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event: disabledEvent, talk });
        const conversation = await conversationFactory({
          event: disabledEvent,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
        });

        const service = ConversationService.forSpeaker(speaker.id, proposal.id);

        await expect(service.deleteMessage({ id: message.id })).rejects.toThrow(ForbiddenOperationError);
      });
    });
  });

  describe('forOrganizer', () => {
    describe('#saveMessage', () => {
      it('creates the conversation and message when the conversation does not exist', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forOrganizer(authorizedEvent, proposal.id).saveMessage({ message: 'Hello speaker!' });

        const conversation = await db.conversation.findFirst({
          where: { eventId: event.id, type: ConversationType.PROPOSAL_SPEAKER_CONVERSATION },
          include: { messages: true },
        });

        expect(conversation?.messages.length).toBe(1);
        expect(conversation?.messages[0].content).toBe('Hello speaker!');
        expect(conversation?.messages[0].senderId).toBe(owner.id);
      });

      it('creates a participant when saving a message', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forOrganizer(authorizedEvent, proposal.id).saveMessage({ message: 'Hello!' });

        const participant = await db.conversationParticipant.findFirst({ where: { userId: owner.id } });

        expect(participant?.role).toBe(ConversationParticipantRole.ORGANIZER);
      });

      it('updates an existing message when an id is provided', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: owner,
          role: ConversationParticipantRole.ORGANIZER,
        });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forOrganizer(authorizedEvent, proposal.id).saveMessage({
          id: message.id,
          message: 'Updated message',
        });

        const updatedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
        expect(updatedMessage?.content).toBe('Updated message');
      });

      it('adds a message to an existing conversation', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
        });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forOrganizer(authorizedEvent, proposal.id).saveMessage({ message: 'Second message' });

        const messages = await db.conversationMessage.findMany({ where: { conversationId: conversation.id } });
        expect(messages.length).toBe(2);
      });

      it('allows an organizer with the manage-conversations permission to update any message', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: member,
          role: ConversationParticipantRole.ORGANIZER,
          attributes: { content: 'Original message' },
        });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forOrganizer(authorizedEvent, proposal.id).saveMessage({
          id: message.id,
          message: 'Updated by owner',
        });

        const updatedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
        expect(updatedMessage?.content).toBe('Updated by owner');
      });

      it('prevents an organizer without the manage-conversations permission from updating other messages', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: owner,
          role: ConversationParticipantRole.ORGANIZER,
          attributes: { content: 'Original message' },
        });
        const authorizedEvent = await authorizeMember();

        await ConversationService.forOrganizer(authorizedEvent, proposal.id).saveMessage({
          id: message.id,
          message: 'Attempted update',
        });

        const result = await db.conversationMessage.findUnique({ where: { id: message.id } });
        expect(result?.content).toBe('Original message');
      });
    });

    describe('#reactMessage', () => {
      it('creates a reaction on a message', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
        });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forOrganizer(authorizedEvent, proposal.id).reactMessage({
          id: message.id,
          code: 'tada',
        });

        const reaction = await db.conversationReaction.findUnique({
          where: { messageId_userId_code: { messageId: message.id, userId: owner.id, code: 'tada' } },
        });
        expect(reaction).toBeDefined();
      });

      it('deletes a reaction when it already exists', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: owner,
          role: ConversationParticipantRole.ORGANIZER,
          traits: ['withReaction'],
        });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forOrganizer(authorizedEvent, proposal.id).reactMessage({
          id: message.id,
          code: 'tada',
        });

        const reaction = await db.conversationReaction.findUnique({
          where: { messageId_userId_code: { messageId: message.id, userId: owner.id, code: 'tada' } },
        });
        expect(reaction).toBeNull();
      });
    });

    describe('#deleteMessage', () => {
      it('deletes the message', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: owner,
          role: ConversationParticipantRole.ORGANIZER,
        });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forOrganizer(authorizedEvent, proposal.id).deleteMessage({ id: message.id });

        const deletedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
        expect(deletedMessage).toBeNull();
      });

      it('allows an organizer with the manage-conversations permission to delete any message', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: member,
          role: ConversationParticipantRole.ORGANIZER,
        });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forOrganizer(authorizedEvent, proposal.id).deleteMessage({ id: message.id });

        const deletedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
        expect(deletedMessage).toBeNull();
      });

      it('prevents an organizer without the manage-conversations permission from deleting other messages', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: owner,
          role: ConversationParticipantRole.ORGANIZER,
        });
        const authorizedEvent = await authorizeMember();

        await ConversationService.forOrganizer(authorizedEvent, proposal.id).deleteMessage({ id: message.id });

        const result = await db.conversationMessage.findUnique({ where: { id: message.id } });
        expect(result).toBeDefined();
      });
    });

    describe('#getConversation', () => {
      it('returns an empty array when the conversation does not exist', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const authorizedEvent = await authorizeOwner();

        const messages = await ConversationService.forOrganizer(authorizedEvent, proposal.id).getConversation();
        expect(messages).toEqual([]);
      });

      it('creates a participant with lastSeenAt on first open', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
        });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forOrganizer(authorizedEvent, proposal.id).getConversation();

        const participant = await db.conversationParticipant.findUnique({
          where: { conversationId_userId: { conversationId: conversation.id, userId: owner.id } },
        });
        expect(participant?.role).toBe(ConversationParticipantRole.ORGANIZER);
        expect(participant?.lastSeenAt).toEqual(new Date('2023-01-01'));
      });

      it('updates lastSeenAt on subsequent opens', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
        });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forOrganizer(authorizedEvent, proposal.id).getConversation();

        vi.setSystemTime(new Date('2023-06-01'));
        await ConversationService.forOrganizer(authorizedEvent, proposal.id).getConversation();

        const participant = await db.conversationParticipant.findUnique({
          where: { conversationId_userId: { conversationId: conversation.id, userId: owner.id } },
        });
        expect(participant?.lastSeenAt).toEqual(new Date('2023-06-01'));
      });

      it('returns messages with sender and reactions', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: owner,
          role: ConversationParticipantRole.ORGANIZER,
          traits: ['withReaction'],
        });
        const authorizedEvent = await authorizeOwner();

        const messages = await ConversationService.forOrganizer(authorizedEvent, proposal.id).getConversation();

        expect(messages.length).toBe(1);
        expect(messages[0].id).toBe(message.id);
        expect(messages[0].sender.name).toBe('Bruce Wayne');
        expect(messages[0].sender.role).toBe(ConversationParticipantRole.ORGANIZER);
        expect(messages[0].reactions).toEqual([
          { code: 'tada', reacted: true, reactedBy: [{ userId: owner.id, name: 'Bruce Wayne' }] },
        ]);
      });

      it('returns messages ordered by creation date ascending', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });

        await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
          attributes: { content: 'First message', createdAt: new Date('2023-01-01T10:00:00Z') },
        });

        await conversationMessageFactory({
          conversation,
          sender: owner,
          role: ConversationParticipantRole.ORGANIZER,
          attributes: { content: 'Second message', createdAt: new Date('2023-01-01T11:00:00Z') },
        });
        const authorizedEvent = await authorizeOwner();

        const messages = await ConversationService.forOrganizer(authorizedEvent, proposal.id).getConversation();

        expect(messages.length).toBe(2);
        expect(messages[0].content).toBe('First message');
        expect(messages[1].content).toBe('Second message');
      });

      it('marks reactions as reacted for the current user', async () => {
        const otherUser = await userFactory();
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
        });

        await db.conversationReaction.createMany({
          data: [
            { messageId: message.id, userId: owner.id, code: 'tada' },
            { messageId: message.id, userId: otherUser.id, code: 'tada' },
          ],
        });
        const authorizedEvent = await authorizeOwner();

        const messages = await ConversationService.forOrganizer(authorizedEvent, proposal.id).getConversation();

        expect(messages[0].reactions[0].reacted).toBe(true);
        expect(messages[0].reactions[0].reactedBy.length).toBe(2);
      });

      it('marks messages from others after lastSeenAt as new', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });

        await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
          attributes: { content: 'Old message', createdAt: new Date('2022-12-01') },
        });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forOrganizer(authorizedEvent, proposal.id).getConversation();

        await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
          attributes: { content: 'New message', createdAt: new Date('2023-02-01') },
        });

        const messages = await ConversationService.forOrganizer(authorizedEvent, proposal.id).getConversation();

        const oldMessage = messages.find((m) => m.content === 'Old message');
        const newMessage = messages.find((m) => m.content === 'New message');
        expect(oldMessage?.isNew).toBe(false);
        expect(newMessage?.isNew).toBe(true);
      });

      it('never marks messages from the current user as new', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forOrganizer(authorizedEvent, proposal.id).getConversation();

        await conversationMessageFactory({
          conversation,
          sender: owner,
          role: ConversationParticipantRole.ORGANIZER,
          attributes: { content: 'My own message', createdAt: new Date('2023-06-01') },
        });

        vi.setSystemTime(new Date('2023-07-01'));
        const messages = await ConversationService.forOrganizer(authorizedEvent, proposal.id).getConversation();

        expect(messages[0].isNew).toBe(false);
      });

      it('marks all messages from others as new on first visit', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });

        await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
          attributes: { content: 'Welcome!', createdAt: new Date('2022-06-01') },
        });
        const authorizedEvent = await authorizeOwner();

        const messages = await ConversationService.forOrganizer(authorizedEvent, proposal.id).getConversation();
        expect(messages[0].isNew).toBe(true);
      });

      it('marks messages before lastSeenAt as not new', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });

        await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
          attributes: { content: 'Old message', createdAt: new Date('2022-06-01') },
        });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forOrganizer(authorizedEvent, proposal.id).getConversation();

        vi.setSystemTime(new Date('2023-06-01'));
        const messages = await ConversationService.forOrganizer(authorizedEvent, proposal.id).getConversation();
        expect(messages[0].isNew).toBe(false);
      });

      it('sorts reactions by earliest reaction date', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: speaker,
          role: ConversationParticipantRole.SPEAKER,
        });

        await db.conversationReaction.createMany({
          data: [
            { messageId: message.id, userId: owner.id, code: 'heart', reactedAt: new Date('2023-01-01T12:00:00Z') },
            { messageId: message.id, userId: owner.id, code: 'tada', reactedAt: new Date('2023-01-01T10:00:00Z') },
          ],
        });
        const authorizedEvent = await authorizeOwner();

        const messages = await ConversationService.forOrganizer(authorizedEvent, proposal.id).getConversation();

        expect(messages[0].reactions[0].code).toBe('tada');
        expect(messages[0].reactions[1].code).toBe('heart');
      });
    });

    describe('proposal access', () => {
      it('rejects reading a proposal outside the organizer event', async () => {
        const otherEvent = await eventFactory({ team });
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event: otherEvent, talk });
        const authorizedEvent = await authorizeOwner();

        const service = ConversationService.forOrganizer(authorizedEvent, proposal.id);

        await expect(service.getConversation()).rejects.toThrow(ProposalNotFoundError);
      });

      it('rejects posting to a proposal outside the organizer event', async () => {
        const otherEvent = await eventFactory({ team });
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event: otherEvent, talk });
        const authorizedEvent = await authorizeOwner();

        const service = ConversationService.forOrganizer(authorizedEvent, proposal.id);

        await expect(service.saveMessage({ message: 'Should fail' })).rejects.toThrow(ProposalNotFoundError);
      });

      it('rejects deleting in a proposal outside the organizer event', async () => {
        const otherEvent = await eventFactory({ team });
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event: otherEvent, talk });
        const authorizedEvent = await authorizeOwner();

        const service = ConversationService.forOrganizer(authorizedEvent, proposal.id);

        await expect(service.deleteMessage({ id: 'whatever' })).rejects.toThrow(ProposalNotFoundError);
      });
    });

    describe('availability gate (speakersConversationEnabled)', () => {
      let disabledEvent: Event;

      beforeEach(async () => {
        disabledEvent = await eventFactory({ team, attributes: { speakersConversationEnabled: false } });
      });

      it('reading returns an empty list when speaker conversations are disabled', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event: disabledEvent, talk });
        const conversation = await conversationFactory({
          event: disabledEvent,
          proposalId: proposal.id,
          type: 'PROPOSAL_SPEAKER_CONVERSATION',
        });
        await conversationMessageFactory({
          conversation,
          sender: owner,
          role: ConversationParticipantRole.ORGANIZER,
        });
        const authorizedEvent = await authorizeOwner(disabledEvent);

        const messages = await ConversationService.forOrganizer(authorizedEvent, proposal.id).getConversation();

        expect(messages).toEqual([]);
      });

      it('posting throws when speaker conversations are disabled', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event: disabledEvent, talk });
        const authorizedEvent = await authorizeOwner(disabledEvent);

        const service = ConversationService.forOrganizer(authorizedEvent, proposal.id);

        await expect(service.saveMessage({ message: 'Hello!' })).rejects.toThrow(ForbiddenOperationError);
      });
    });
  });

  describe('forReviewComments', () => {
    describe('#saveMessage', () => {
      it('saves a message to the review-comments conversation', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forReviewComments(authorizedEvent, proposal.id).saveMessage({
          message: 'Review comment!',
        });

        const conversation = await db.conversation.findFirst({
          where: { eventId: event.id, type: ConversationType.PROPOSAL_REVIEW_COMMENTS },
          include: { messages: true },
        });

        expect(conversation?.messages.length).toBe(1);
        expect(conversation?.messages[0].content).toBe('Review comment!');
      });

      it('allows an organizer with the manage-conversations permission to update any message', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_REVIEW_COMMENTS',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: member,
          role: ConversationParticipantRole.ORGANIZER,
          attributes: { content: 'Original message' },
        });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forReviewComments(authorizedEvent, proposal.id).saveMessage({
          id: message.id,
          message: 'Updated by owner',
        });

        const updatedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
        expect(updatedMessage?.content).toBe('Updated by owner');
      });

      it('prevents an organizer without the manage-conversations permission from updating other messages', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_REVIEW_COMMENTS',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: owner,
          role: ConversationParticipantRole.ORGANIZER,
          attributes: { content: 'Original message' },
        });
        const authorizedEvent = await authorizeMember();

        await ConversationService.forReviewComments(authorizedEvent, proposal.id).saveMessage({
          id: message.id,
          message: 'Attempted update',
        });

        const result = await db.conversationMessage.findUnique({ where: { id: message.id } });
        expect(result?.content).toBe('Original message');
      });

      it('throws when the proposal does not belong to the event', async () => {
        const otherEvent = await eventFactory({ team });
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event: otherEvent, talk });
        const authorizedEvent = await authorizeOwner();

        const service = ConversationService.forReviewComments(authorizedEvent, proposal.id);

        await expect(service.saveMessage({ message: 'Should fail' })).rejects.toThrow(ProposalNotFoundError);
      });
    });

    describe('#reactMessage', () => {
      it('reacts to a message in the review-comments conversation', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_REVIEW_COMMENTS',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: member,
          role: ConversationParticipantRole.ORGANIZER,
        });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forReviewComments(authorizedEvent, proposal.id).reactMessage({
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
          type: 'PROPOSAL_REVIEW_COMMENTS',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: owner,
          role: ConversationParticipantRole.ORGANIZER,
        });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forReviewComments(authorizedEvent, proposal.id).deleteMessage({ id: message.id });

        const deletedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
        expect(deletedMessage).toBeNull();
      });

      it('allows an organizer with the manage-conversations permission to delete any message', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_REVIEW_COMMENTS',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: member,
          role: ConversationParticipantRole.ORGANIZER,
        });
        const authorizedEvent = await authorizeOwner();

        await ConversationService.forReviewComments(authorizedEvent, proposal.id).deleteMessage({ id: message.id });

        const deletedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
        expect(deletedMessage).toBeNull();
      });

      it('prevents an organizer without the manage-conversations permission from deleting other messages', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_REVIEW_COMMENTS',
        });
        const message = await conversationMessageFactory({
          conversation,
          sender: owner,
          role: ConversationParticipantRole.ORGANIZER,
        });
        const authorizedEvent = await authorizeMember();

        await ConversationService.forReviewComments(authorizedEvent, proposal.id).deleteMessage({ id: message.id });

        const result = await db.conversationMessage.findUnique({ where: { id: message.id } });
        expect(result).toBeDefined();
      });
    });

    describe('#getConversation', () => {
      it('returns the conversation messages for the proposal', async () => {
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event, talk });
        const conversation = await conversationFactory({
          event,
          proposalId: proposal.id,
          type: 'PROPOSAL_REVIEW_COMMENTS',
        });
        await conversationMessageFactory({
          conversation,
          sender: owner,
          role: ConversationParticipantRole.ORGANIZER,
          attributes: { content: 'Review note' },
        });
        const authorizedEvent = await authorizeMember();

        const messages = await ConversationService.forReviewComments(authorizedEvent, proposal.id).getConversation();

        expect(messages.length).toBe(1);
        expect(messages[0].content).toBe('Review note');
      });

      it('throws when the proposal does not belong to the event', async () => {
        const otherEvent = await eventFactory({ team });
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event: otherEvent, talk });
        const authorizedEvent = await authorizeMember();

        const service = ConversationService.forReviewComments(authorizedEvent, proposal.id);

        await expect(service.getConversation()).rejects.toThrow(ProposalNotFoundError);
      });

      it('stays available regardless of the speakers-conversation toggle', async () => {
        const disabledEvent = await eventFactory({ team, attributes: { speakersConversationEnabled: false } });
        const talk = await talkFactory({ speakers: [speaker] });
        const proposal = await proposalFactory({ event: disabledEvent, talk });
        const conversation = await conversationFactory({
          event: disabledEvent,
          proposalId: proposal.id,
          type: 'PROPOSAL_REVIEW_COMMENTS',
        });
        await conversationMessageFactory({
          conversation,
          sender: owner,
          role: ConversationParticipantRole.ORGANIZER,
          attributes: { content: 'Internal note' },
        });
        const authorizedEvent = await authorizeOwner(disabledEvent);

        const messages = await ConversationService.forReviewComments(authorizedEvent, proposal.id).getConversation();

        expect(messages.length).toBe(1);
        expect(messages[0].content).toBe('Internal note');
      });
    });
  });
});
