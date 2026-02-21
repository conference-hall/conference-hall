import { conversationMessageFactory } from 'tests/factories/conversation-messages.ts';
import { conversationFactory } from 'tests/factories/conversations.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ProposalNotFoundError } from '~/shared/errors.server.ts';
import { db } from '../../../../prisma/db.server.ts';
import type { Event, User } from '../../../../prisma/generated/client.ts';
import { ConversationContextType, ConversationParticipantRole } from '../../../../prisma/generated/client.ts';
import { ProposalConversationForSpeakers } from './proposal-conversation-for-speakers.server.ts';

describe('ProposalConversationForSpeakers', () => {
  let speaker: User;
  let anotherSpeaker: User;
  let event: Event;

  beforeEach(async () => {
    speaker = await userFactory({ traits: ['clark-kent'] });
    anotherSpeaker = await userFactory({ traits: ['bruce-wayne'] });
    const organizer = await userFactory();
    const team = await teamFactory({ owners: [organizer] });
    event = await eventFactory({ team });
  });

  describe('#saveMessage', () => {
    it('saves message to proposal conversation', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      await ProposalConversationForSpeakers.for(speaker.id, proposal.id).saveMessage({ message: 'Hello!' });

      const conversation = await db.conversation.findFirst({
        where: { eventId: event.id, contextType: ConversationContextType.PROPOSAL_CONVERSATION },
        include: { messages: true },
      });

      expect(conversation?.messages.length).toBe(1);
      expect(conversation?.messages[0].content).toBe('Hello!');
    });

    it('throws error when speaker does not belong to proposal', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      const service = ProposalConversationForSpeakers.for(anotherSpeaker.id, proposal.id);

      await expect(service.saveMessage({ message: 'Hello!' })).rejects.toThrowError(ProposalNotFoundError);
    });

    it('throws error when proposal does not exist', async () => {
      const service = ProposalConversationForSpeakers.for(speaker.id, 'non-existent');

      await expect(service.saveMessage({ message: 'Hello!' })).rejects.toThrowError(ProposalNotFoundError);
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

      await ProposalConversationForSpeakers.for(speaker.id, proposal.id).reactMessage({
        id: message.id,
        code: 'tada',
      });

      const reaction = await db.conversationReaction.findUnique({
        where: { messageId_userId_code: { messageId: message.id, userId: speaker.id, code: 'tada' } },
      });
      expect(reaction).toBeDefined();
    });

    it('throws error when speaker does not belong to proposal', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: speaker,
        role: ConversationParticipantRole.SPEAKER,
      });

      const service = ProposalConversationForSpeakers.for(anotherSpeaker.id, proposal.id);

      await expect(service.reactMessage({ id: message.id, code: 'tada' })).rejects.toThrowError(ProposalNotFoundError);
    });
  });

  describe('#deleteMessage', () => {
    it('deletes message from proposal conversation', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: speaker,
        role: ConversationParticipantRole.SPEAKER,
      });

      await ProposalConversationForSpeakers.for(speaker.id, proposal.id).deleteMessage({ id: message.id });

      const deletedMessage = await db.conversationMessage.findUnique({ where: { id: message.id } });
      expect(deletedMessage).toBeNull();
    });

    it('throws error when speaker does not belong to proposal', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      const message = await conversationMessageFactory({
        conversation,
        sender: speaker,
        role: ConversationParticipantRole.SPEAKER,
      });

      const service = ProposalConversationForSpeakers.for(anotherSpeaker.id, proposal.id);

      await expect(service.deleteMessage({ id: message.id })).rejects.toThrowError(ProposalNotFoundError);
    });
  });

  describe('#getConversation', () => {
    it('returns conversation messages for proposal', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const conversation = await conversationFactory({ event, proposalId: proposal.id });
      await conversationMessageFactory({
        conversation,
        sender: speaker,
        role: ConversationParticipantRole.SPEAKER,
        attributes: { content: 'Message from speaker' },
      });

      const messages = await ProposalConversationForSpeakers.for(speaker.id, proposal.id).getConversation();

      expect(messages.length).toBe(1);
      expect(messages[0].content).toBe('Message from speaker');
    });

    it('throws error when speaker does not belong to proposal', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      const service = ProposalConversationForSpeakers.for(anotherSpeaker.id, proposal.id);

      await expect(service.getConversation()).rejects.toThrowError(ProposalNotFoundError);
    });

    it('throws error when proposal does not exist', async () => {
      const service = ProposalConversationForSpeakers.for(speaker.id, 'non-existent');

      await expect(service.getConversation()).rejects.toThrowError(ProposalNotFoundError);
    });
  });
});
