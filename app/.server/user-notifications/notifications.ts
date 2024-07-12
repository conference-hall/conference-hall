import { db } from 'prisma/db.server.ts';

export class Notifications {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new Notifications(userId);
  }

  async unreadCount() {
    return db.proposal.count({
      where: {
        deliberationStatus: 'ACCEPTED',
        confirmationStatus: 'PENDING',
        publicationStatus: 'PUBLISHED',
        speakers: { some: { id: this.userId } },
      },
    });
  }

  async list() {
    const acceptedProposals = await db.proposal.findMany({
      include: { event: true },
      where: {
        deliberationStatus: 'ACCEPTED',
        confirmationStatus: 'PENDING',
        publicationStatus: 'PUBLISHED',
        speakers: { some: { id: this.userId } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return acceptedProposals.map((proposal) => ({
      type: 'ACCEPTED_PROPOSAL',
      proposal: {
        id: proposal.id,
        title: proposal.title,
      },
      event: {
        slug: proposal.event.slug,
        name: proposal.event.name,
      },
      date: proposal.updatedAt.toISOString(),
    }));
  }
}
