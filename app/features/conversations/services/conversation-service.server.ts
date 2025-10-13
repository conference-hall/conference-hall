import { db } from 'prisma/db.server.ts';
import type { ConversationContextType } from 'prisma/generated/enums.ts';
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

// todo(conversation): add tests
export class ConversationService {
  private context: ConversationServiceContext;

  constructor(context: ConversationServiceContext) {
    this.context = context;
  }

  async saveMessage(eventId: string, { id, message }: ConversationMessageSaveData) {
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
        await tx.conversationMessage.update({ data: { content: message }, where: { id, senderId: userId } });
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

  async deleteMessage({ id }: ConversationMessageDeleteData) {
    const { userId } = this.context;
    await db.conversationMessage.delete({ where: { id, senderId: userId } });
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
          // todo(conversation): check N+1 ???
          include: { sender: true, reactions: { include: { reactedBy: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return (
      conversation?.messages.map((message) => {
        const participant = conversation.participants.find((p) => p.userId === message.senderId);
        return {
          id: message.id,
          sender: {
            userId: message.sender?.id || '',
            name: message.sender?.name || 'System',
            picture: message.sender?.picture || null,
            role: participant?.role,
          },
          content: message.content,
          // todo(conversation): should group by code
          reactions: message.reactions.map((reaction) => ({
            code: reaction.code,
            reacted: reaction.userId === userId,
            reactedBy: [reaction.reactedBy.name],
          })),
          sentAt: message.createdAt,
        };
      }) || []
    );
  }
}
