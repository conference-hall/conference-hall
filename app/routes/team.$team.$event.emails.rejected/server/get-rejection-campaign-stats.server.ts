import { TeamRole } from '@prisma/client';

import { db } from '~/libs/db';
import { allowedForEvent } from '~/server/teams/check-user-role.server';

export async function getRejectionCampaignStats(eventSlug: string, userId: string) {
  await allowedForEvent(eventSlug, userId, [TeamRole.OWNER, TeamRole.MEMBER]);

  const toSend = await db.proposal.count({
    where: { event: { slug: eventSlug }, status: 'REJECTED', emailRejectedStatus: null },
  });
  const sentStatusCount = await db.proposal.count({
    where: { event: { slug: eventSlug }, status: 'REJECTED', emailRejectedStatus: 'SENT' },
  });
  const deliveredStatusCount = await db.proposal.count({
    where: { event: { slug: eventSlug }, status: 'REJECTED', emailRejectedStatus: 'DELIVERED' },
  });

  return { toSend, sent: sentStatusCount + deliveredStatusCount, delivered: deliveredStatusCount };
}
