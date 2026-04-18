import { db } from '../../../../../prisma/db.server.ts';
import type { ResolvedProposalEvent, ResolvedRecipient } from '../proposal-event.resolver.server.ts';

export async function dispatchInApp(resolved: ResolvedProposalEvent, recipient: ResolvedRecipient): Promise<void> {
  await db.notification.create({
    data: {
      userId: recipient.userId,
      type: resolved.notificationType,
      data: {
        eventSlug: resolved.data.eventSlug,
        eventName: resolved.data.eventName,
        proposalId: resolved.data.proposalId,
        proposalTitle: resolved.data.proposalTitle,
      },
    },
  });
}
