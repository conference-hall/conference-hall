import { TeamRole } from '@prisma/client';

import { db } from '~/libs/db.ts';
import { allowedForEvent } from '~/routes/__server/teams/check-user-role.server.ts';

export async function getAcceptationCampaignStats(eventSlug: string, userId: string) {
  await allowedForEvent(eventSlug, userId, [TeamRole.OWNER, TeamRole.MEMBER]);

  const toSend = await db.proposal.count({
    where: {
      event: { slug: eventSlug },
      status: { in: ['ACCEPTED', 'CONFIRMED', 'DECLINED'] },
      emailAcceptedStatus: null,
    },
  });
  const sentStatusCount = await db.proposal.count({
    where: {
      event: { slug: eventSlug },
      status: { in: ['ACCEPTED', 'CONFIRMED', 'DECLINED'] },
      emailAcceptedStatus: 'SENT',
    },
  });
  const deliveredStatusCount = await db.proposal.count({
    where: {
      event: { slug: eventSlug },
      status: { in: ['ACCEPTED', 'CONFIRMED', 'DECLINED'] },
      emailAcceptedStatus: 'DELIVERED',
    },
  });

  return { toSend, sent: sentStatusCount + deliveredStatusCount, delivered: deliveredStatusCount };
}
