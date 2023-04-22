import type { Prisma } from '@prisma/client';
import { EmailStatus } from '@prisma/client';
import { db } from '~/libs/db';
import type { EmailStatusData, ProposalsFilters } from '~/schemas/proposal';

const RESULTS_BY_PAGE = 20;

export class OrganizerProposalsSearch {
  eventSlug: string;
  userId: string;
  filters: ProposalsFilters;

  constructor(eventSlug: string, userId: string, filters: ProposalsFilters) {
    this.eventSlug = eventSlug;
    this.userId = userId;
    this.filters = filters;
  }

  async statistics() {
    const byStatus = await this.countByStatus();
    const reviewed = await this.countUserReviews();
    const total = byStatus.reduce((acc, next) => acc + next._count.status, 0);
    const statuses = byStatus.map((stat) => ({ name: stat.status, count: stat._count.status }));

    return { total, reviewed, statuses };
  }

  async proposalsByPage(pageIndex: number = 0) {
    return db.proposal.findMany({
      include: { speakers: true, ratings: true },
      where: this.whereClause(),
      orderBy: this.orderByClause(),
      skip: pageIndex * RESULTS_BY_PAGE,
      take: RESULTS_BY_PAGE,
    });
  }

  async proposals() {
    return db.proposal.findMany({
      include: { speakers: true, ratings: true, formats: true, categories: true },
      where: this.whereClause(),
      orderBy: this.orderByClause(),
    });
  }

  async proposalsIds() {
    const proposals = await db.proposal.findMany({
      select: { id: true },
      where: this.whereClause(),
      orderBy: this.orderByClause(),
    });
    return proposals.map(({ id }) => id);
  }

  /// Privates methods

  private countByStatus() {
    return db.proposal.groupBy({
      _count: { status: true },
      by: ['status'],
      where: this.whereClause(),
      orderBy: { _count: { status: 'desc' } },
    });
  }

  private countUserReviews() {
    return db.rating.count({
      where: { proposal: this.whereClause(), userId: this.userId },
    });
  }

  private whereClause(): Prisma.ProposalWhereInput {
    const { query, ratings, formats, categories, status, emailAcceptedStatus, emailRejectedStatus } = this.filters;
    const ratingClause = ratings === 'rated' ? { some: { userId: this.userId } } : { none: { userId: this.userId } };

    return {
      event: { slug: this.eventSlug },
      status: { in: status, not: 'DRAFT' },
      formats: formats ? { some: { id: formats } } : {},
      categories: categories ? { some: { id: categories } } : {},
      ratings: ratings ? ratingClause : {},
      emailAcceptedStatus: this.mapEmailStatus(emailAcceptedStatus),
      emailRejectedStatus: this.mapEmailStatus(emailRejectedStatus),
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { speakers: { some: { name: { contains: query, mode: 'insensitive' } } } },
      ],
    };
  }

  private orderByClause(): Prisma.ProposalOrderByWithRelationInput[] {
    if (this.filters.sort === 'oldest') {
      return [{ createdAt: 'asc' }, { title: 'asc' }];
    }
    return [{ createdAt: 'desc' }, { title: 'asc' }];
  }

  private mapEmailStatus(emailStatus: EmailStatusData) {
    switch (emailStatus) {
      case 'sent':
        return { in: [EmailStatus.SENT, EmailStatus.DELIVERED] };
      case 'not-sent':
        return null;
      default:
        return undefined;
    }
  }
}
