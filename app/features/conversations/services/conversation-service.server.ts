import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError, ProposalNotFoundError } from '~/shared/errors.server.ts';
import type { EmojiReaction } from '~/shared/types/emojis.types.ts';
import { db } from '../../../../prisma/db.server.ts';
import type { ConversationType, ConversationReaction, User } from '../../../../prisma/generated/client.ts';
import type {
  ConversationMessageDeleteData,
  ConversationMessageReactData,
  ConversationMessageSaveData,
} from './conversation.schema.server.ts';
import { NOTIFICATION_DELAY, notifyConversationMessage } from './jobs/notify-conversation-message.job.ts';

// The access strategy decides who may reach the proposal a conversation hangs off of.
// SPEAKER_OWNS_PROPOSAL: the actor must be one of the proposal's speakers.
// PROPOSAL_IN_EVENT: the proposal must belong to the actor's authorized event.
type AccessStrategy = 'SPEAKER_OWNS_PROPOSAL' | 'PROPOSAL_IN_EVENT';

// One policy descriptor per conversation context, resolved by a factory. It captures the axes
// that vary between contexts so the public methods stay context-agnostic.
type ConversationPolicy = {
  userId: string;
  role: 'ORGANIZER' | 'SPEAKER';
  type: ConversationType;
  proposalId: string;
  eventId: string | null; // known up-front for organizers, resolved from the proposal for speakers
  accessStrategy: AccessStrategy;
  availabilityGated: boolean; // whether the speakers-conversation toggle gates this context
  canManageConversations: boolean;
  skipNotification: boolean;
};

export class ConversationService {
  private policy: ConversationPolicy;

  private constructor(policy: ConversationPolicy) {
    this.policy = policy;
  }

  // Speaker viewing the speaker↔organizer thread on their own proposal.
  static forSpeaker(userId: string, proposalId: string) {
    return new ConversationService({
      userId,
      role: 'SPEAKER',
      type: 'PROPOSAL_SPEAKER_CONVERSATION',
      proposalId,
      eventId: null,
      accessStrategy: 'SPEAKER_OWNS_PROPOSAL',
      availabilityGated: true,
      canManageConversations: false,
      skipNotification: false,
    });
  }

  // Organizer viewing the speaker↔organizer thread on a proposal of their event.
  static forOrganizer(authorizedEvent: AuthorizedEvent, proposalId: string) {
    return new ConversationService({
      userId: authorizedEvent.userId,
      role: 'ORGANIZER',
      type: 'PROPOSAL_SPEAKER_CONVERSATION',
      proposalId,
      eventId: authorizedEvent.event.id,
      accessStrategy: 'PROPOSAL_IN_EVENT',
      availabilityGated: true,
      canManageConversations: authorizedEvent.permissions.canManageConversations,
      skipNotification: false,
    });
  }

  // Organizer-internal review-comments thread: never gated, never notifies the speaker.
  static forReviewComments(authorizedEvent: AuthorizedEvent, proposalId: string) {
    return new ConversationService({
      userId: authorizedEvent.userId,
      role: 'ORGANIZER',
      type: 'PROPOSAL_REVIEW_COMMENTS',
      proposalId,
      eventId: authorizedEvent.event.id,
      accessStrategy: 'PROPOSAL_IN_EVENT',
      availabilityGated: false,
      canManageConversations: authorizedEvent.permissions.canManageConversations,
      skipNotification: true,
    });
  }

  async saveMessage({ id, message }: ConversationMessageSaveData) {
    const { eventId, speakersConversationEnabled } = await this.resolveProposal();
    this.assertWritable(speakersConversationEnabled);

    const { userId, role, type, proposalId, canManageConversations, skipNotification } = this.policy;

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

        if (skipNotification) return;

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
    const { speakersConversationEnabled } = await this.resolveProposal();
    this.assertWritable(speakersConversationEnabled);

    const { userId } = this.policy;

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
    const { speakersConversationEnabled } = await this.resolveProposal();
    this.assertWritable(speakersConversationEnabled);

    const { userId, canManageConversations } = this.policy;
    await db.conversationMessage.deleteMany({ where: { id, senderId: canManageConversations ? undefined : userId } });
  }

  async getConversation() {
    const { eventId, speakersConversationEnabled } = await this.resolveProposal();
    if (this.policy.availabilityGated && !speakersConversationEnabled) return [];

    const { userId, role, type, proposalId } = this.policy;

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

  // The single access step: guards (throws when the actor may not reach the proposal) and resolves
  // the proposal's event id and speaker-conversation availability flag, shared by every method.
  private async resolveProposal() {
    const { proposalId, accessStrategy, userId, eventId } = this.policy;

    const where =
      accessStrategy === 'SPEAKER_OWNS_PROPOSAL'
        ? { id: proposalId, speakers: { some: { userId } } }
        : { id: proposalId, eventId: eventId ?? undefined };

    const proposal = await db.proposal.findFirst({
      where,
      select: { eventId: true, event: { select: { speakersConversationEnabled: true } } },
    });

    if (!proposal) throw new ProposalNotFoundError();

    return { eventId: proposal.eventId, speakersConversationEnabled: proposal.event.speakersConversationEnabled };
  }

  // Writes to a gated context are rejected when the event has speaker conversations disabled.
  private assertWritable(speakersConversationEnabled: boolean) {
    if (this.policy.availabilityGated && !speakersConversationEnabled) {
      throw new ForbiddenOperationError();
    }
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
