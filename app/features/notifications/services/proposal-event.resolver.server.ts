import { logger } from '~/shared/logger/logger.server.ts';
import { db } from '../../../../prisma/db.server.ts';
import type { NotificationEvent } from './notification-events.server.ts';
import { EVENT_NOTIFICATION_TYPE } from './notification-events.server.ts';

export type ResolvedRecipient = {
  userId: string;
  email: string;
  locale: string;
};

export type ResolvedProposalEvent = {
  type: NotificationEvent['type'];
  notificationType: (typeof EVENT_NOTIFICATION_TYPE)[NotificationEvent['type']];
  recipients: Array<ResolvedRecipient>;
  data: {
    eventId: string;
    eventSlug: string;
    eventName: string;
    eventLogo: string | null;
    proposalId: string;
    proposalTitle: string;
    formats: Array<{ name: string }>;
  };
};

export async function resolveProposalEvent(event: NotificationEvent): Promise<ResolvedProposalEvent | null> {
  const proposal = await db.proposal.findUnique({
    where: { id: event.proposalId },
    include: {
      speakers: { where: { userId: { not: null } }, include: { user: true } },
      formats: true,
      event: true,
    },
  });

  if (!proposal) {
    logger.warn('Notification resolver: proposal not found', { proposalId: event.proposalId });
    return null;
  }

  const recipients = proposal.speakers
    .filter((s) => s.userId && s.user)
    .map((s) => ({ userId: s.userId!, email: s.email, locale: s.user!.locale }));

  return {
    type: event.type,
    notificationType: EVENT_NOTIFICATION_TYPE[event.type],
    recipients,
    data: {
      eventId: proposal.event.id,
      eventSlug: proposal.event.slug,
      eventName: proposal.event.name,
      eventLogo: proposal.event.logo,
      proposalId: proposal.id,
      proposalTitle: proposal.title,
      formats: proposal.formats.map((f) => ({ name: f.name })),
    },
  };
}
