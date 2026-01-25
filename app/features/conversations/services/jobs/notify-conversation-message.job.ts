import type { MessageRole } from '~/shared/types/conversation.types.ts';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import ConversationMessageEmail from '~/shared/emails/templates/speakers/conversation-message.tsx';
import { job } from '~/shared/jobs/job.ts';
import type { EventSpeaker, Proposal } from '../../../../../prisma/generated/client.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { getSharedServerEnv } from '../../../../../servers/environment.server.ts';

type NotifyConversationMessagePayload = {
  conversationId: string;
};

const { NODE_ENV } = getSharedServerEnv();

// Notification delay - 5 min in production
export const NOTIFICATION_DELAY = NODE_ENV === 'production' ? 5 * 60 * 1000 : 2 * 1000;

// Extra buffer to account for job scheduling delays
const TIME_WINDOW_BUFFER_MS = 5 * 1000;

export const notifyConversationMessage = job<NotifyConversationMessagePayload>({
  name: 'notify-conversation-message',
  queue: 'default',
  run: async ({ conversationId }: NotifyConversationMessagePayload) => {
    // Fetch conversation with related data
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        event: { include: { team: true } },
        participants: { include: { user: true } },
        messages: {
          where: { createdAt: { gte: new Date(Date.now() - (NOTIFICATION_DELAY + TIME_WINDOW_BUFFER_MS)) } },
          orderBy: { createdAt: 'desc' },
          include: { sender: true },
        },
      },
    });

    if (!conversation || conversation.messages.length === 0) return;

    // Check if the event has speaker conversations enabled
    if (!conversation.event.speakersConversationEnabled) return;

    // Get the last message and its sender
    const lastMessage = conversation.messages[0];
    if (!lastMessage || !lastMessage.senderId) return;

    const senderId = lastMessage.senderId;

    // Get proposal if this is a proposal conversation
    let proposal: (Proposal & { routeId: string; speakers: Array<EventSpeaker> }) | null = null;
    let proposalSpeakers: Array<{ email: string; locale: string; userId: string | null }> = [];

    if (conversation.contextType === 'PROPOSAL_CONVERSATION' && conversation.contextIds.length > 0) {
      const proposalId = conversation.contextIds[0];
      proposal = await db.proposal.findUnique({ where: { id: proposalId }, include: { speakers: true } });

      if (proposal) {
        proposalSpeakers = proposal.speakers.map((speaker) => ({
          email: speaker.email,
          locale: speaker.locale,
          userId: speaker.userId,
        }));
      }
    }

    // Collect all unique recipients (participants + proposal speakers - sender)
    const recipientsMap = new Map<string, { email: string; locale: string; role: MessageRole | null }>();

    // Add participants
    for (const participant of conversation.participants) {
      if (participant.userId !== senderId && participant.user) {
        recipientsMap.set(participant.user.email, {
          email: participant.user.email,
          locale: participant.user.locale,
          role: participant.role,
        });
      }
    }

    // Add proposal speakers
    for (const speaker of proposalSpeakers) {
      if (speaker.userId !== senderId) {
        // Only add if not already in the map or update role to SPEAKER
        recipientsMap.set(speaker.email, { email: speaker.email, locale: speaker.locale, role: 'SPEAKER' });
      }
    }

    if (recipientsMap.size === 0) return;

    // Send email to each recipient with their locale
    await Promise.all(
      Array.from(recipientsMap.values()).map(async (recipient) => {
        const payload = ConversationMessageEmail.buildPayload(
          {
            recipient: {
              email: recipient.email,
              role: recipient.role,
            },
            event: {
              id: conversation.event.id,
              slug: conversation.event.slug,
              name: conversation.event.name,
              logoUrl: conversation.event.logoUrl,
              teamSlug: conversation.event.team.slug,
            },
            proposal: proposal ? { id: proposal.id, routeId: proposal.routeId } : undefined,
            sender: {
              name: lastMessage.sender?.name || 'System',
              role: conversation.participants.find((p) => p.userId === senderId)?.role || null,
            },
            message: {
              content: lastMessage.content,
              preview: lastMessage.content.substring(0, 150),
            },
            messagesCount: conversation.messages.length,
          },
          recipient.locale,
        );

        await sendEmail.trigger(payload);
      }),
    );
  },
});
