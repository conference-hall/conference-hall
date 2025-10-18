import { db } from 'prisma/db.server.ts';
import type { ConversationReaction, User } from 'prisma/generated/client.ts';
import type { ConversationContextType } from 'prisma/generated/enums.ts';
import type { EmojiReaction } from '~/shared/types/emojis.types.ts';
import type {
  ConversationMessageDeleteData,
  ConversationMessageReactData,
  ConversationMessageSaveData,
} from './conversation.schema.server.ts';

type ConversationServiceContext = {
  userId: string;
  role: 'ORGANIZER' | 'SPEAKER';
  contextType: ConversationContextType;
  contextIds?: Array<string>;
};

export class ConversationService {
  private context: ConversationServiceContext;

  constructor(context: ConversationServiceContext) {
    this.context = context;
  }

  async saveMessage(eventId: string, { id, message }: ConversationMessageSaveData, canManageConversations?: boolean) {
    const { userId, role, contextType, contextIds } = this.context;

    await db.$transaction(async (tx) => {
      // Create conversation if it doesn't exist
      let conversation = await tx.conversation.findFirst({
        where: {
          eventId,
          contextType,
          contextIds: contextIds ? { hasSome: contextIds } : undefined,
        },
      });

      if (!conversation) {
        conversation = await tx.conversation.create({ data: { eventId, contextType, contextIds } });
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
    const { userId, contextType, contextIds } = this.context;

    // Get conversation
    const conversation = await db.conversation.findFirst({
      where: {
        eventId,
        contextType,
        contextIds: contextIds ? { hasSome: contextIds } : undefined,
      },
      include: {
        participants: true,
        messages: {
          include: { reactions: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) return [];

    const users = await db.user.findMany({ where: { id: { in: conversation.participants.map((p) => p.userId) } } });

    return (
      conversation?.messages.map((message) => {
        const participant = conversation.participants.find((p) => p.userId === message.senderId);
        const sender = users.find((user) => user.id === participant?.userId);
        return {
          id: message.id,
          sender: {
            userId: sender?.id || '',
            name: sender?.name || 'System',
            picture: sender?.picture || null,
            role: participant?.role,
          },
          content: message.content,
          reactions: this.mapReactions(message.reactions, users, userId),
          sentAt: message.createdAt,
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
      .sort((a, b) => a.minDate.getTime() - b.minDate.getTime())
      .map(({ code, reacted, reactedBy }) => ({ code, reacted, reactedBy }));
  }
}
