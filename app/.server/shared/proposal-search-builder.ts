import type { Prisma } from '@prisma/client';
import { db } from 'prisma/db.server.ts';

import type { Pagination } from '~/.server/shared/pagination';

import type { ProposalsFilters, ReviewsFilter, StatusFilter } from './proposal-search-builder.types';

type SearchOptions = { withSpeakers: boolean; withReviews: boolean };

export class ProposalSearchBuilder {
  eventSlug: string;
  userId: string;
  filters: ProposalsFilters;
  options: SearchOptions;

  constructor(eventSlug: string, userId: string, filters: ProposalsFilters, options?: SearchOptions) {
    this.eventSlug = eventSlug;
    this.userId = userId;
    this.filters = filters;
    this.options = options || { withSpeakers: true, withReviews: true };
  }

  async statistics() {
    const total = await this.count();
    const reviewed = await this.countUserReviews();
    return { total, reviewed };
  }

  async proposalsByPage(pagination: Pagination) {
    return db.proposal.findMany({
      include: { speakers: this.options.withSpeakers, reviews: this.options.withReviews },
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

  private count() {
    return db.proposal.count({ where: this.whereClause() });
  }

  private countUserReviews() {
    return db.review.count({
      where: { proposal: this.whereClause(), userId: this.userId },
    });
  }

  private whereClause(): Prisma.ProposalWhereInput {
    const { query, reviews, formats, categories, status } = this.filters;

    return {
      event: { slug: this.eventSlug },
      isDraft: false,
      formats: formats ? { some: { id: formats } } : undefined,
      categories: categories ? { some: { id: categories } } : undefined,
      reviews: this.reviewsClause(reviews),
      OR: this.whereSearchClause(query),
      ...this.whereStatus(status),
    };
  }

  private whereStatus(status?: StatusFilter): Prisma.ProposalWhereInput {
    if (status === 'pending') return { deliberationStatus: 'PENDING' };
    if (status === 'accepted') return { deliberationStatus: 'ACCEPTED' };
    if (status === 'rejected') return { deliberationStatus: 'REJECTED' };
    if (status === 'not-answered') return { deliberationStatus: 'ACCEPTED', confirmationStatus: 'PENDING' };
    if (status === 'confirmed') return { deliberationStatus: 'ACCEPTED', confirmationStatus: 'CONFIRMED' };
    if (status === 'declined') return { deliberationStatus: 'ACCEPTED', confirmationStatus: 'DECLINED' };
    return {};
  }

  private whereSearchClause(query?: string) {
    if (!query) return undefined;

    const byTitle: Prisma.ProposalWhereInput = { title: { contains: query, mode: 'insensitive' } };
    const bySpeakers: Prisma.ProposalWhereInput = {
      speakers: { some: { name: { contains: query, mode: 'insensitive' } } },
    };
    if (this.options.withSpeakers) return [byTitle, bySpeakers];

    return [byTitle];
  }

  private reviewsClause(reviews?: ReviewsFilter): Prisma.ReviewListRelationFilter | undefined {
    if (!reviews) return undefined;
    if (reviews === 'reviewed') return { some: { userId: this.userId } };
    if (reviews === 'not-reviewed') return { none: { userId: this.userId } };
    if (reviews === 'my-favorites') return { some: { userId: this.userId, feeling: 'POSITIVE' } };
  }

  private orderByClause(): Prisma.ProposalOrderByWithRelationInput[] {
    switch (this.filters.sort) {
      case 'highest':
        return [{ avgRateForSort: { sort: 'desc', nulls: 'last' } }, { title: 'asc' }];
      case 'lowest':
        return [{ avgRateForSort: { sort: 'asc', nulls: 'first' } }, { title: 'asc' }];
      case 'oldest':
        return [{ createdAt: 'asc' }, { title: 'asc' }];
      default:
        return [{ createdAt: 'desc' }, { title: 'asc' }];
    }
  }
}
