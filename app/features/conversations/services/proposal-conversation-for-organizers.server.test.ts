import { db } from 'prisma/db.server.ts';
import type { Event, Team, User } from 'prisma/generated/client.ts';
import { ConversationParticipantRole } from 'prisma/generated/enums.ts';
import { conversationMessageFactory } from 'tests/factories/conversation-messages.ts';
import { conversationFactory } from 'tests/factories/conversations.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { ProposalConversationForOrganizers } from './proposal-conversation-for-organizers.server.ts';

describe('ProposalConversationForOrganizers', () => {
  let owner: User;
  let speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    speaker = await userFactory();
    team = await teamFactory({ owners: [owner] });
    event = await eventFactory({ team });
  });

  describe('#addMessage', () => {
    it('creates conversation, participant and message on first message', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const conversationService = ProposalConversationForOrganizers.for(owner.id, team.slug, event.slug, proposal.id);
      await conversationService.addMessage({ message: 'Hello speaker' });

      const conversation = await db.conversation.findFirst({
        where: { eventId: event.id, contextType: 'PROPOSAL', contextIds: { has: proposal.id } },
      });
      expect(conversation).toBeDefined();

      const participant = await db.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId: conversation!.id, userId: owner.id } },
      });
      expect(participant).toBeDefined();
      expect(participant?.role).toBe('ORGANIZER');

      const messages = await db.conversationMessage.findMany({ where: { conversationId: conversation!.id } });
      expect(messages.length).toBe(1);
      expect(messages[0].content).toBe('Hello speaker');
      expect(messages[0].senderId).toBe(owner.id);
    });

    it('reuses existing conversation when adding subsequent messages', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });

      const conversationService = ProposalConversationForOrganizers.for(owner.id, team.slug, event.slug, proposal.id);
      await conversationService.addMessage({ message: 'First message' });
      await conversationService.addMessage({ message: 'Second message' });

      const conversations = await db.conversation.findMany({
        where: { eventId: event.id, contextType: 'PROPOSAL', contextIds: { has: proposal.id } },
      });
      expect(conversations.length).toBe(1);

      const messages = await db.conversationMessage.findMany({ where: { conversationId: conversation.id } });
      expect(messages.length).toBe(2);
    });

    it('adds organizer as participant only once', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const conversationService = ProposalConversationForOrganizers.for(owner.id, team.slug, event.slug, proposal.id);
      await conversationService.addMessage({ message: 'First message' });
      await conversationService.addMessage({ message: 'Second message' });

      const conversation = await db.conversation.findFirst({
        where: { eventId: event.id, contextType: 'PROPOSAL', contextIds: { has: proposal.id } },
      });

      const participants = await db.conversationParticipant.findMany({
        where: { conversationId: conversation!.id, userId: owner.id },
      });
      expect(participants.length).toBe(1);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const conversation = ProposalConversationForOrganizers.for(user.id, team.slug, event.slug, proposal.id);

      await expect(conversation.addMessage({ message: 'Hello' })).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#getConversation', () => {
    it('returns empty array when no conversation exists', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const messages = await ProposalConversationForOrganizers.for(
        owner.id,
        team.slug,
        event.slug,
        proposal.id,
      ).getConversation();

      expect(messages).toEqual([]);
    });

    it('returns messages for a conversation', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      await conversationMessageFactory({
        conversation,
        sender: owner,
        role: ConversationParticipantRole.ORGANIZER,
        attributes: { content: 'Hello from organizer' },
      });
      await conversationMessageFactory({
        conversation,
        sender: speaker,
        role: ConversationParticipantRole.SPEAKER,
        attributes: { content: 'Hello from speaker' },
      });

      const messages = await ProposalConversationForOrganizers.for(
        owner.id,
        team.slug,
        event.slug,
        proposal.id,
      ).getConversation();

      expect(messages.length).toBe(2);
      expect(messages[0].content).toBe('Hello from organizer');
      expect(messages[0].sender.userId).toBe(owner.id);
      expect(messages[0].sender.name).toBe(owner.name);
      expect(messages[0].sender.role).toBe('ORGANIZER');
      expect(messages[1].content).toBe('Hello from speaker');
      expect(messages[1].sender.userId).toBe(speaker.id);
      expect(messages[1].sender.role).toBe('SPEAKER');
    });

    it('throws an error if proposal does not exist', async () => {
      const conversation = ProposalConversationForOrganizers.for(owner.id, team.slug, event.slug, 'invalid-id');

      await expect(conversation.getConversation()).rejects.toThrowError('Proposal not found');
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const conversation = ProposalConversationForOrganizers.for(user.id, team.slug, event.slug, proposal.id);

      await expect(conversation.getConversation()).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
