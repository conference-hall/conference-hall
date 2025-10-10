import { db } from 'prisma/db.server.ts';
import { ProposalNotFoundError } from '~/shared/errors.server.ts';
import type { Message } from '~/shared/types/conversation.types.ts';
import type { ConversationMessageCreateData } from './conversation.schema.server.ts';

// todo(conversation): extract common code of conversations (orga vs. speaker sides)
export class ProposalConversationForSpeakers {
  private userId: string;
  private proposalId: string;

  constructor(userId: string, proposalId: string) {
    this.userId = userId;
    this.proposalId = proposalId;
  }

  static for(userId: string, proposalId: string) {
    return new ProposalConversationForSpeakers(userId, proposalId);
  }

  async addMessage({ message }: ConversationMessageCreateData) {
    const proposal = await db.proposal.findFirst({
      where: { id: this.proposalId, speakers: { some: { userId: this.userId } } },
      include: { event: true },
    });
    if (!proposal) throw new ProposalNotFoundError();

    await db.$transaction(async (tx) => {
      // Create conversation if it doesn't exist
      let conversation = await tx.conversation.findFirst({
        where: { eventId: proposal.eventId, contextType: 'PROPOSAL', contextIds: { has: this.proposalId } },
      });

      if (!conversation) {
        conversation = await tx.conversation.create({
          data: { eventId: proposal.eventId, contextType: 'PROPOSAL', contextIds: [this.proposalId] },
        });
      }

      // Add speaker as participant if not exists
      await tx.conversationParticipant.upsert({
        where: { conversationId_userId: { conversationId: conversation.id, userId: this.userId } },
        create: { conversationId: conversation.id, userId: this.userId, role: 'SPEAKER' },
        update: {},
      });

      // Create message
      await tx.conversationMessage.create({
        data: { conversationId: conversation.id, senderId: this.userId, content: message, type: 'TEXT' },
      });
    });
  }

  async getConversation() {
    const proposal = await db.proposal.findFirst({
      where: { id: this.proposalId, speakers: { some: { userId: this.userId } } },
      include: { event: true },
    });
    if (!proposal) throw new ProposalNotFoundError();

    // Get conversation
    const conversation = await db.conversation.findFirst({
      where: { eventId: proposal.eventId, contextType: 'PROPOSAL', contextIds: { has: this.proposalId } },
      include: {
        participants: true,
        messages: {
          include: { sender: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Map messages
    const messages: Array<Message> =
      conversation?.messages.map((message) => {
        const participant = conversation.participants.find((p) => p.userId === message.senderId);
        return {
          id: message.id,
          sender: {
            userId: message.sender?.id || '',
            name: message.sender?.name || 'System',
            picture: message.sender?.picture || null,
            role: participant?.role || 'ORGANIZER', // todo(conversation): role should be on the message, not the participants?
          },
          content: message.content,
          reactions: [], // Not implemented in this version
          sentAt: message.createdAt,
        };
      }) || [];

    return messages;
  }
}
