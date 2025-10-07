import { db } from 'prisma/db.server.ts';
import type { Message } from '~/shared/types/conversation.types.ts';
import { UserEventAuthorization } from '~/shared/user/user-event-authorization.server.ts';

export class ProposalConversationForOrganizers extends UserEventAuthorization {
  private proposalId: string;

  constructor(userId: string, team: string, event: string, proposalId: string) {
    super(userId, team, event);
    this.proposalId = proposalId;
  }

  static for(userId: string, team: string, event: string, proposalId: string) {
    return new ProposalConversationForOrganizers(userId, team, event, proposalId);
  }

  async addMessage(content: string) {
    const event = await this.needsPermission('canAccessEvent');

    await db.$transaction(async (tx) => {
      // Create conversation if it doesn't exist
      let conversation = await tx.conversation.findFirst({
        where: { eventId: event.id, contextType: 'PROPOSAL', contextIds: { has: this.proposalId } },
      });

      if (!conversation) {
        conversation = await tx.conversation.create({
          data: { eventId: event.id, contextType: 'PROPOSAL', contextIds: [this.proposalId] },
        });
      }

      // Add organizer as participant if not exists
      await tx.conversationParticipant.upsert({
        where: { conversationId_userId: { conversationId: conversation.id, userId: this.userId } },
        create: { conversationId: conversation.id, userId: this.userId, role: 'ORGANIZER' },
        update: {},
      });

      // Create message
      await tx.conversationMessage.create({
        data: { conversationId: conversation.id, senderId: this.userId, content, type: 'TEXT' },
      });
    });
  }

  async getConversation() {
    const event = await this.needsPermission('canAccessEvent');

    // Get proposal with speakers
    const proposal = await db.proposal.findUnique({ where: { id: this.proposalId } });
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    // Get conversation
    const conversation = await db.conversation.findFirst({
      where: {
        eventId: event.id,
        contextType: 'PROPOSAL',
        contextIds: { has: this.proposalId },
      },
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
            role: participant?.role || 'ORGANIZER',
          },
          content: message.content,
          reactions: [], // Not implemented in this version
          sentAt: message.createdAt,
        };
      }) || [];

    return messages;
  }
}
