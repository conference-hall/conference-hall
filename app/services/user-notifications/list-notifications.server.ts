import { db } from '../../libs/db';

export enum NOTIFICATION_TYPE {
  ACCEPTED_PROPOSAL = 'ACCEPTED_PROPOSAL',
}

export async function listNotifications(userId: string) {
  const acceptedProposals = await db.proposal.findMany({
    include: { event: true },
    where: {
      status: 'ACCEPTED',
      emailAcceptedStatus: { not: null },
      speakers: { some: { id: userId } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return acceptedProposals.map((proposal) => ({
    type: NOTIFICATION_TYPE.ACCEPTED_PROPOSAL,
    proposal: {
      id: proposal.id,
      title: proposal.title,
    },
    event: {
      slug: proposal.event.slug,
      name: proposal.event.name,
    },
    date: proposal.updatedAt.toUTCString(),
  }));
}
