import { ConversationParticipantRole, db } from '@conference-hall/database';
import { conversationMessageFactory } from '@conference-hall/database/tests/factories/conversation-messages.ts';
import { conversationFactory } from '@conference-hall/database/tests/factories/conversations.ts';
import { eventFactory } from '@conference-hall/database/tests/factories/events.ts';
import { proposalFactory } from '@conference-hall/database/tests/factories/proposals.ts';
import { talkFactory } from '@conference-hall/database/tests/factories/talks.ts';
import { userFactory } from '@conference-hall/database/tests/factories/users.ts';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import { notifyConversationMessage } from './notify-conversation-message.job.ts';

describe('notifyConversationMessage job', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sends email to participants and speakers except sender', async () => {
    const event = await eventFactory({ attributes: { speakersConversationEnabled: true } });
    const organizer1 = await userFactory({ attributes: { email: 'organizer1@test.com', locale: 'en' } });
    const organizer2 = await userFactory({ attributes: { email: 'organizer2@test.com', locale: 'en' } });
    const speaker1 = await userFactory({ attributes: { email: 'speaker1@test.com', locale: 'en' } });
    const speaker2 = await userFactory({ attributes: { email: 'speaker2@test.com', locale: 'fr' } });

    const talk = await talkFactory({ speakers: [speaker1, speaker2] });
    const proposal = await proposalFactory({ event, talk });
    const conversation = await conversationFactory({ event, proposalId: proposal.id });

    await db.conversationParticipant.createMany({
      data: [
        { conversationId: conversation.id, userId: organizer1.id, role: ConversationParticipantRole.ORGANIZER },
        { conversationId: conversation.id, userId: organizer2.id, role: ConversationParticipantRole.ORGANIZER },
        { conversationId: conversation.id, userId: speaker1.id, role: ConversationParticipantRole.SPEAKER },
      ],
    });

    await conversationMessageFactory({
      conversation,
      sender: organizer1,
      role: ConversationParticipantRole.ORGANIZER,
      attributes: { content: 'Hello speakers!', createdAt: new Date('2023-01-01T10:00:00Z') },
    });

    await notifyConversationMessage.config.run({ conversationId: conversation.id });

    expect(sendEmail.trigger).toHaveBeenCalledTimes(3);

    expect(sendEmail.trigger).toHaveBeenCalledWith(
      expect.objectContaining({
        template: 'speakers-conversation-message',
        to: ['organizer2@test.com'],
        locale: 'en',
      }),
    );

    expect(sendEmail.trigger).toHaveBeenCalledWith(
      expect.objectContaining({
        template: 'speakers-conversation-message',
        to: ['speaker1@test.com'],
        locale: 'en',
      }),
    );

    expect(sendEmail.trigger).toHaveBeenCalledWith(
      expect.objectContaining({
        template: 'speakers-conversation-message',
        to: ['speaker2@test.com'],
        locale: 'fr',
      }),
    );
  });

  it('includes message preview when single message', async () => {
    const event = await eventFactory({ attributes: { speakersConversationEnabled: true } });
    const organizer = await userFactory({ attributes: { email: 'organizer@test.com' } });
    const speaker = await userFactory({ attributes: { email: 'speaker@test.com' } });

    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });
    const conversation = await conversationFactory({ event, proposalId: proposal.id });

    await db.conversationParticipant.create({
      data: { conversationId: conversation.id, userId: organizer.id, role: ConversationParticipantRole.ORGANIZER },
    });

    await conversationMessageFactory({
      conversation,
      sender: speaker,
      role: ConversationParticipantRole.SPEAKER,
      attributes: { content: 'This is a test message with some content', createdAt: new Date('2023-01-01T10:00:00Z') },
    });

    await notifyConversationMessage.config.run({ conversationId: conversation.id });

    expect(sendEmail.trigger).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          messagesCount: 1,
          message: expect.objectContaining({
            content: 'This is a test message with some content',
            preview: 'This is a test message with some content',
          }),
        }),
      }),
    );
  });

  it('shows message count when multiple messages in time window', async () => {
    const event = await eventFactory({ attributes: { speakersConversationEnabled: true } });
    const organizer = await userFactory({ attributes: { email: 'organizer@test.com' } });
    const speaker = await userFactory({ attributes: { email: 'speaker@test.com' } });

    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });
    const conversation = await conversationFactory({ event, proposalId: proposal.id });

    await db.conversationParticipant.create({
      data: { conversationId: conversation.id, userId: organizer.id, role: ConversationParticipantRole.ORGANIZER },
    });

    await conversationMessageFactory({
      conversation,
      sender: speaker,
      role: ConversationParticipantRole.SPEAKER,
      attributes: { content: 'First message', createdAt: new Date('2023-01-01T09:59:58.5Z') },
    });

    await conversationMessageFactory({
      conversation,
      sender: speaker,
      role: ConversationParticipantRole.SPEAKER,
      attributes: { content: 'Second message', createdAt: new Date('2023-01-01T09:59:59.5Z') },
    });

    await conversationMessageFactory({
      conversation,
      sender: speaker,
      role: ConversationParticipantRole.SPEAKER,
      attributes: { content: 'Third message', createdAt: new Date('2023-01-01T10:00:00Z') },
    });

    await notifyConversationMessage.config.run({ conversationId: conversation.id });

    expect(sendEmail.trigger).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          messagesCount: 3,
          message: expect.objectContaining({
            content: 'Third message',
          }),
        }),
      }),
    );
  });

  it('does not send if speakersConversationEnabled is false', async () => {
    const event = await eventFactory({ attributes: { speakersConversationEnabled: false } });
    const organizer = await userFactory({ attributes: { email: 'organizer@test.com' } });
    const speaker = await userFactory({ attributes: { email: 'speaker@test.com' } });

    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });
    const conversation = await conversationFactory({ event, proposalId: proposal.id });

    await db.conversationParticipant.create({
      data: { conversationId: conversation.id, userId: organizer.id, role: ConversationParticipantRole.ORGANIZER },
    });

    await conversationMessageFactory({
      conversation,
      sender: speaker,
      role: ConversationParticipantRole.SPEAKER,
    });

    await notifyConversationMessage.config.run({ conversationId: conversation.id });

    expect(sendEmail.trigger).not.toHaveBeenCalled();
  });

  it('handles different locales per recipient', async () => {
    const event = await eventFactory({ attributes: { speakersConversationEnabled: true } });
    const organizer = await userFactory({ attributes: { email: 'organizer@test.com', locale: 'fr' } });
    const speaker1 = await userFactory({ attributes: { email: 'speaker1@test.com', locale: 'en' } });
    const speaker2 = await userFactory({ attributes: { email: 'speaker2@test.com', locale: 'fr' } });

    const talk = await talkFactory({ speakers: [speaker1, speaker2] });
    const proposal = await proposalFactory({ event, talk });
    const conversation = await conversationFactory({ event, proposalId: proposal.id });

    await db.conversationParticipant.create({
      data: { conversationId: conversation.id, userId: organizer.id, role: ConversationParticipantRole.ORGANIZER },
    });

    await conversationMessageFactory({
      conversation,
      sender: organizer,
      role: ConversationParticipantRole.ORGANIZER,
    });

    await notifyConversationMessage.config.run({ conversationId: conversation.id });

    expect(sendEmail.trigger).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'en',
        to: ['speaker1@test.com'],
      }),
    );

    expect(sendEmail.trigger).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'fr',
        to: ['speaker2@test.com'],
      }),
    );
  });

  it('does not send if conversation not found', async () => {
    await notifyConversationMessage.config.run({ conversationId: 'non-existent' });

    expect(sendEmail.trigger).not.toHaveBeenCalled();
  });

  it('does not send if no messages in time window', async () => {
    const event = await eventFactory({ attributes: { speakersConversationEnabled: true } });
    const speaker = await userFactory({ attributes: { email: 'speaker@test.com' } });

    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });
    const conversation = await conversationFactory({ event, proposalId: proposal.id });

    await conversationMessageFactory({
      conversation,
      sender: speaker,
      role: ConversationParticipantRole.SPEAKER,
      attributes: { createdAt: new Date('2023-01-01T08:00:00Z') },
    });

    await notifyConversationMessage.config.run({ conversationId: conversation.id });

    expect(sendEmail.trigger).not.toHaveBeenCalled();
  });

  it('does not send if message has no sender', async () => {
    const event = await eventFactory({ attributes: { speakersConversationEnabled: true } });
    const speaker = await userFactory({ attributes: { email: 'speaker@test.com' } });

    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });
    const conversation = await conversationFactory({ event, proposalId: proposal.id });

    await db.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: null,
        content: 'System message',
        type: 'SYSTEM',
        createdAt: new Date('2023-01-01T10:00:00Z'),
      },
    });

    await notifyConversationMessage.config.run({ conversationId: conversation.id });

    expect(sendEmail.trigger).not.toHaveBeenCalled();
  });

  it('deduplicates recipients by email', async () => {
    const event = await eventFactory({ attributes: { speakersConversationEnabled: true } });
    const organizer = await userFactory({ attributes: { email: 'organizer@test.com' } });
    const speaker = await userFactory({ attributes: { email: 'speaker@test.com', locale: 'en' } });

    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });
    const conversation = await conversationFactory({ event, proposalId: proposal.id });

    await db.conversationParticipant.createMany({
      data: [
        { conversationId: conversation.id, userId: organizer.id, role: ConversationParticipantRole.ORGANIZER },
        { conversationId: conversation.id, userId: speaker.id, role: ConversationParticipantRole.SPEAKER },
      ],
    });

    await conversationMessageFactory({
      conversation,
      sender: organizer,
      role: ConversationParticipantRole.ORGANIZER,
    });

    await notifyConversationMessage.config.run({ conversationId: conversation.id });

    expect(sendEmail.trigger).toHaveBeenCalledTimes(1);
    expect(sendEmail.trigger).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['speaker@test.com'],
      }),
    );
  });
});
