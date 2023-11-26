import type { Prisma } from '@prisma/client';
import { EmailStatus } from '@prisma/client';

import type { Pagination } from '~/domains/shared/Pagination';
import { db } from '~/libs/db.ts';

import type { EmailStatusData, ProposalsFilters } from './ProposalSearchBuilder.types';

type SearchOptions = { withSpeakers: boolean };

export class ProposalSearchBuilder {
  eventSlug: string;
  userId: string;
  filters: ProposalsFilters;
  options: SearchOptions;

  constructor(eventSlug: string, userId: string, filters: ProposalsFilters, options?: SearchOptions) {
    this.eventSlug = eventSlug;
    this.userId = userId;
    this.filters = filters;
    this.options = options || { withSpeakers: true };
  }

  async statistics() {
    const byStatus = await this.countByStatus();
    const reviewed = await this.countUserReviews();
    const total = byStatus.reduce((acc, next) => acc + next._count.status, 0);
    const statuses = byStatus.map((stat) => ({ name: stat.status, count: stat._count.status }));

    return { total, reviewed, statuses };
  }

  async proposalsByPage(pagination: Pagination) {
    return db.proposal.findMany({
      include: { speakers: this.options.withSpeakers, reviews: true },
      where: this.whereClause(),
      orderBy: this.orderByClause(),
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
    });
  }

  async proposals(select: { reviews: boolean } = { reviews: true }) {
    return db.proposal.findMany({
      include: {
        speakers: this.options.withSpeakers,
        reviews: select.reviews,
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
    return db.review.count({
      where: { proposal: this.whereClause(), userId: this.userId },
    });
  }

  private whereClause(): Prisma.ProposalWhereInput {
    const { query, reviews, formats, categories, status, emailAcceptedStatus, emailRejectedStatus } = this.filters;

    const reviewClause = reviews === 'reviewed' ? { some: { userId: this.userId } } : { none: { userId: this.userId } };

    return {
      event: { slug: this.eventSlug },
      status: { in: status, not: 'DRAFT' },
      formats: formats ? { some: { id: formats } } : undefined,
      categories: categories ? { some: { id: categories } } : undefined,
      reviews: reviews ? reviewClause : undefined,
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

    if (this.options.withSpeakers) return [byTitle, bySpeakers];

    return [byTitle];
  }

  private orderByClause(): Prisma.ProposalOrderByWithRelationInput[] {
    switch (this.filters.sort) {
      case 'highest':
        return [{ avgRateForSort: 'desc' }, { title: 'asc' }];
      case 'lowest':
        return [{ avgRateForSort: 'asc' }, { title: 'asc' }];
      case 'oldest':
        return [{ createdAt: 'asc' }, { title: 'asc' }];
      default:
        return [{ createdAt: 'desc' }, { title: 'asc' }];
    }
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
