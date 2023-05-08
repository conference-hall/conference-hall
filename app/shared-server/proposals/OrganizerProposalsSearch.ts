import type { Prisma } from '@prisma/client';
import { EmailStatus } from '@prisma/client';
import { db } from '~/libs/db';
import type { EmailStatusData, ProposalsFilters } from '~/schemas/proposal';

type SearchOptions = { searchBySpeakers: boolean };

export class OrganizerProposalsSearch {
  eventSlug: string;
  userId: string;
  filters: ProposalsFilters;
  options: SearchOptions;

  constructor(eventSlug: string, userId: string, filters: ProposalsFilters, options?: SearchOptions) {
    this.eventSlug = eventSlug;
    this.userId = userId;
    this.filters = filters;
    this.options = options || { searchBySpeakers: true };
  }

  async statistics() {
    const byStatus = await this.countByStatus();
    const reviewed = await this.countUserReviews();
    const total = byStatus.reduce((acc, next) => acc + next._count.status, 0);
    const statuses = byStatus.map((stat) => ({ name: stat.status, count: stat._count.status }));

    return { total, reviewed, statuses };
  }

  async proposalsByPage(pageIndex: number = 0, pageSize: number) {
    return db.proposal.findMany({
      include: { speakers: this.options.searchBySpeakers, ratings: true },
      where: this.whereClause(),
      orderBy: this.orderByClause(),
      skip: pageIndex * pageSize,
      take: pageSize,
    });
  }

  async proposals(select: { ratings: boolean } = { ratings: true }) {
    return db.proposal.findMany({
      include: {
        speakers: this.options.searchBySpeakers,
        ratings: select.ratings,
        formats: true,
        categories: true,
      },
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
      formats: formats ? { some: { id: formats } } : undefined,
      categories: categories ? { some: { id: categories } } : undefined,
      ratings: ratings ? ratingClause : undefined,
      emailAcceptedStatus: this.mapEmailStatus(emailAcceptedStatus),
      emailRejectedStatus: this.mapEmailStatus(emailRejectedStatus),
      OR: this.whereQueryClause(query),
    };
  }

  private whereQueryClause(query?: string) {
    if (!query) return undefined;

    const byTitle: Prisma.ProposalWhereInput = { title: { contains: query, mode: 'insensitive' } };
    const bySpeakers: Prisma.ProposalWhereInput = {
      speakers: { some: { name: { contains: query, mode: 'insensitive' } } },
    };

    if (this.options.searchBySpeakers) return [byTitle, bySpeakers];

    return [byTitle];
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
