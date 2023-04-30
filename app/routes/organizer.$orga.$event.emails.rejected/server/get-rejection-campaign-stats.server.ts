import { allowedForEvent } from '~/shared-server/organizations/check-user-role.server';
import { OrganizationRole } from '@prisma/client';
import { db } from '~/libs/db';

export async function getRejectionCampaignStats(eventSlug: string, userId: string) {
  await allowedForEvent(eventSlug, userId, [OrganizationRole.OWNER, OrganizationRole.MEMBER]);

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
