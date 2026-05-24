import type { EmojiReaction } from '~/shared/types/emojis.types.ts';
import { db } from '../../../../prisma/db.server.ts';
import type { ConversationType, ConversationReaction, User } from '../../../../prisma/generated/client.ts';
import type {
  ConversationMessageDeleteData,
  ConversationMessageReactData,
  ConversationMessageSaveData,
} from './conversation.schema.server.ts';
import { NOTIFICATION_DELAY, notifyConversationMessage } from './jobs/notify-conversation-message.job.ts';

type ConversationServiceContext = {
  userId: string;
  role: 'ORGANIZER' | 'SPEAKER';
  type: ConversationType;
  proposalId: string;
  skipNotification?: boolean;
};

export class ConversationService {
  private context: ConversationServiceContext;

  constructor(context: ConversationServiceContext) {
    this.context = context;
  }

  async saveMessage(eventId: string, { id, message }: ConversationMessageSaveData, canManageConversations?: boolean) {
    const { userId, role, type, proposalId } = this.context;

    await db.$transaction(async (tx) => {
      // Create conversation if it doesn't exist
      let conversation = await tx.conversation.findFirst({ where: { eventId, type, proposalId } });

      if (!conversation) {
        conversation = await tx.conversation.create({ data: { eventId, type, proposalId } });
      }

      // Add participant if not exists
      await tx.conversationParticipant.upsert({
        where: { conversationId_userId: { conversationId: conversation.id, userId } },
        create: { conversationId: conversation.id, userId, role },
        update: {},
      });

      if (id) {
        // Update message
        await tx.conversationMessage.updateMany({
          data: { content: message },
          where: { id, senderId: canManageConversations ? undefined : userId },
        });
      } else {
        // Create message
        await tx.conversationMessage.create({
          data: { conversationId: conversation.id, senderId: userId, content: message, type: 'TEXT' },
        });

        if (this.context.skipNotification) return;

        // Trigger email notification job with debounce per conversation
        // This ensures that only one notification is sent even if multiple messages are created in succession
        await notifyConversationMessage.trigger(
          { conversationId: conversation.id },
          {
            deduplication: { id: conversation.id, ttl: NOTIFICATION_DELAY, extend: true, replace: true },
            delay: NOTIFICATION_DELAY,
          },
        );
      }
    });
  }

  async reactMessage({ id, code }: ConversationMessageReactData) {
    const { userId } = this.context;

    const existingReaction = await db.conversationReaction.findUnique({
      where: { messageId_userId_code: { userId, messageId: id, code } },
    });

    // delete
    if (existingReaction) {
      return db.conversationReaction.delete({
        where: { messageId_userId_code: { userId, messageId: id, code } },
      });
    }

    // create
    return db.conversationReaction.create({ data: { userId, messageId: id, code } });
  }

  async deleteMessage({ id }: ConversationMessageDeleteData, canManageConversations?: boolean) {
    const { userId } = this.context;
    await db.conversationMessage.deleteMany({ where: { id, senderId: canManageConversations ? undefined : userId } });
  }

  async getConversation(eventId: string) {
    const { userId, role, type, proposalId } = this.context;

    // Get conversation
    const conversation = await db.conversation.findFirst({
      where: { type, proposalId, event: { id: eventId } },
      include: {
        participants: { include: { user: true } },
        messages: { include: { reactions: true }, orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) return [];

    // Read previous lastSeenAt before updating it
    const currentParticipant = conversation.participants.find((p) => p.userId === userId);
    const previousLastSeenAt = currentParticipant?.lastSeenAt;

    // Track read state: upsert participant with lastSeenAt
    await db.conversationParticipant.upsert({
      where: { conversationId_userId: { conversationId: conversation.id, userId } },
      create: { conversationId: conversation.id, userId, role, lastSeenAt: new Date() },
      update: { lastSeenAt: new Date() },
    });

    const users = conversation.participants.map((participant) => participant.user);

    return (
      conversation?.messages.map((message) => {
        const participant = conversation.participants.find((p) => p.userId === message.senderId);
        const isNew = !previousLastSeenAt || message.createdAt > previousLastSeenAt;
        return {
          id: message.id,
          sender: {
            userId: participant?.user?.id || '',
            name: participant?.user?.name || 'System',
            picture: participant?.user?.picture || null,
            role: participant?.role,
          },
          content: message.content,
          reactions: this.mapReactions(message.reactions, users, userId),
          sentAt: message.createdAt,
          isNew: isNew && message.senderId !== userId,
        };
      }) || []
    );
  }

  private mapReactions(
    reactions: Array<ConversationReaction>,
    users: Array<User>,
    currentUserId: string,
  ): Array<EmojiReaction> {
    return Object.values(
      reactions.reduce(
        (acc, reaction) => {
          if (!acc[reaction.code]) {
            acc[reaction.code] = {
              code: reaction.code,
              reacted: false,
              reactedBy: [],
              minDate: reaction.reactedAt,
            };
          }
          if (reaction.userId === currentUserId) {
            acc[reaction.code].reacted = true;
          }
          const reactedBy = users.find((user) => user.id === reaction.userId);
          acc[reaction.code].reactedBy.push({
            userId: reaction.userId,
            name: reactedBy?.name || 'Unknown',
          });
          if (reaction.reactedAt < acc[reaction.code].minDate) {
            acc[reaction.code].minDate = reaction.reactedAt;
          }
          return acc;
        },
        {} as Record<string, EmojiReaction & { minDate: Date }>,
      ),
    )
      .toSorted((a, b) => a.minDate.getTime() - b.minDate.getTime())
      .map(({ code, reacted, reactedBy }) => ({ code, reacted, reactedBy }));
  }
}
