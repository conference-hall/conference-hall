import { sendEmail } from '~/shared/emails/send-email.job.ts';
import ConversationDigestEmail, {
  type DigestEvent,
} from '~/shared/emails/templates/speakers/conversation-digest.email.tsx';
import { buildConversationDigestUrl, buildUnsubscribeUrl } from '~/shared/emails/utils/urls.ts';
import { flags } from '~/shared/feature-flags/flags.server.ts';
import { job } from '~/shared/jobs/job.ts';
import { db } from '../../../../prisma/db.server.ts';
import { generateUnsubscribeToken } from '../services/unsubscribe-token.server.ts';

// A conversation line accumulated for one recipient: enough to render the email and to advance the
// recipient's digest watermark afterwards.
type DigestLine = {
  participantId: string;
  maxCreatedAt: Date;
  count: number;
  thread: 'speaker' | 'review';
  url: string;
  eventId: string;
  eventName: string;
  eventLogo: string | null;
  proposalId: string;
  proposalTitle: string;
};

type RecipientDigest = {
  userId: string;
  email: string;
  locale: string;
  lines: Array<DigestLine>;
};

// The conversation digest: scan every conversation for unread messages, build one catch-up email per
// recipient, and fan out a `sendEmail` job each. The job is a thin orchestrator — heavy rendering and
// sending happen in the per-recipient `sendEmail` jobs. Runs daily via the `repeat` schedule below.
export const conversationDigest = job<void>({
  name: 'conversation-digest',
  queue: 'default',
  // Run once a day at 08:00 UTC. Users have no stored timezone, so the digest is sent at a fixed
  // wall-clock time rather than per-recipient.
  repeat: { pattern: '0 8 * * *', tz: 'UTC' },

  run: async () => {
    const enabled = await flags.get('conversationDigest');
    if (!enabled) return;

    const conversations = await db.conversation.findMany({
      where: { messages: { some: { type: 'TEXT' } } },
      select: {
        id: true,
        type: true,
        proposalId: true,
        proposal: { select: { title: true } },
        event: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
            speakersConversationEnabled: true,
            team: { select: { slug: true } },
          },
        },
        participants: {
          select: {
            id: true,
            userId: true,
            role: true,
            lastSeenAt: true,
            lastDigestedAt: true,
            user: { select: { email: true, locale: true, conversationDigestEnabled: true, deletedAt: true } },
          },
        },
        messages: {
          where: { type: 'TEXT' },
          select: { senderId: true, createdAt: true },
        },
      },
    });

    // Group unread lines by recipient (user id). The participant list is the source of truth.
    const byRecipient = new Map<string, RecipientDigest>();

    for (const conversation of conversations) {
      const thread = conversation.type === 'PROPOSAL_SPEAKER_CONVERSATION' ? 'speaker' : 'review';

      // Speaker threads are only digested for events that still have speaker conversations enabled.
      // Review threads are always digested, independent of that flag.
      if (thread === 'speaker' && !conversation.event.speakersConversationEnabled) continue;

      for (const participant of conversation.participants) {
        const user = participant.user;
        if (!user || user.deletedAt || !user.conversationDigestEnabled) continue;

        // Watermark = the later of "read in-app" and "already emailed". A message is unread when it
        // was authored by someone else after that watermark.
        const watermark = maxDate(participant.lastSeenAt, participant.lastDigestedAt);
        const unread = conversation.messages.filter(
          (message) =>
            message.senderId &&
            message.senderId !== participant.userId &&
            (!watermark || message.createdAt > watermark),
        );
        if (unread.length === 0) continue;

        const maxCreatedAt = unread.reduce((max, m) => (m.createdAt > max ? m.createdAt : max), unread[0].createdAt);

        const recipient = byRecipient.get(participant.userId) ?? {
          userId: participant.userId,
          email: user.email,
          locale: user.locale,
          lines: [],
        };
        recipient.lines.push({
          participantId: participant.id,
          maxCreatedAt,
          count: unread.length,
          thread,
          url: buildConversationDigestUrl({
            role: participant.role,
            thread,
            teamSlug: conversation.event.team.slug,
            eventSlug: conversation.event.slug,
            proposalId: conversation.proposalId,
          }),
          eventId: conversation.event.id,
          eventName: conversation.event.name,
          eventLogo: conversation.event.logo,
          proposalId: conversation.proposalId,
          proposalTitle: conversation.proposal.title,
        });
        byRecipient.set(participant.userId, recipient);
      }
    }

    // For each recipient: advance the digest watermark for the included participants (at-most-once —
    // a later hard send-failure must not re-emit), then enqueue their email.
    for (const recipient of byRecipient.values()) {
      await db.$transaction(
        recipient.lines.map((line) =>
          db.conversationParticipant.update({
            where: { id: line.participantId },
            data: { lastDigestedAt: line.maxCreatedAt },
          }),
        ),
      );

      const events = groupLines(recipient.lines);
      const unsubscribeUrl = buildUnsubscribeUrl(generateUnsubscribeToken(recipient.userId));
      await sendEmail.trigger(
        ConversationDigestEmail.buildPayload({ email: recipient.email, events, unsubscribeUrl }, recipient.locale),
      );
    }
  },
});

function maxDate(a: Date | null, b: Date | null): Date | null {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

// Shape the flat per-recipient lines into the nested event → proposal → conversation structure the
// email template renders.
function groupLines(lines: Array<DigestLine>): Array<DigestEvent> {
  const events = new Map<string, DigestEvent & { proposalIndex: Map<string, number> }>();

  for (const line of lines) {
    let event = events.get(line.eventId);
    if (!event) {
      event = { name: line.eventName, logo: line.eventLogo, proposals: [], proposalIndex: new Map() };
      events.set(line.eventId, event);
    }

    let proposalIdx = event.proposalIndex.get(line.proposalId);
    if (proposalIdx === undefined) {
      proposalIdx = event.proposals.length;
      event.proposals.push({ title: line.proposalTitle, conversations: [] });
      event.proposalIndex.set(line.proposalId, proposalIdx);
    }

    event.proposals[proposalIdx].conversations.push({ type: line.thread, count: line.count, url: line.url });
  }

  return [...events.values()].map(({ name, logo, proposals }) => ({ name, logo, proposals }));
}
