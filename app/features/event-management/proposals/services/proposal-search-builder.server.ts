import type { Pagination } from '~/shared/pagination/pagination.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { Prisma } from '../../../../../prisma/generated/client.ts';
import type {
  ProposalOrderByWithRelationInput,
  ProposalWhereInput,
  ReviewListRelationFilter,
} from '../../../../../prisma/generated/models.ts';
import type { ProposalsFilters, ReviewsFilter, StatusFilter } from './proposal-search-builder.schema.server.ts';

type SearchOptions = { withSpeakers: boolean; withReviews: boolean };

type QueryParseResult =
  | { type: 'proposal-number'; number: number }
  | { type: 'text-search'; query: string }
  | { type: 'empty' };

export class ProposalSearchBuilder {
  eventId: string;
  userId: string;
  filters: ProposalsFilters;
  options: SearchOptions;

  constructor(eventId: string, userId: string, filters: ProposalsFilters, options?: SearchOptions) {
    this.eventId = eventId;
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
    const isSortedByComments = this.filters.sort === 'most-comments' || this.filters.sort === 'fewest-comments';

    const proposals = await db.proposal.findMany({
      include: {
        speakers: this.options.withSpeakers,
        reviews: this.options.withReviews,
        tags: true,
      },
      where: this.whereClause(),
      orderBy: isSortedByComments ? undefined : this.orderByClause(),
      skip: isSortedByComments ? undefined : pagination.pageIndex * pagination.pageSize,
      take: isSortedByComments ? undefined : pagination.pageSize,
    });

    const proposalIds = proposals.map((p) => p.id);
    const reviewCommentCounts = await this.countReviewComments(proposalIds);

    const results = proposals.map((proposal) => ({
      ...proposal,
      _count: { comments: reviewCommentCounts.get(proposal.id) ?? 0 },
    }));

    if (isSortedByComments) {
      const direction = this.filters.sort === 'most-comments' ? -1 : 1;
      results.sort((a, b) => {
        const diff = (a._count.comments - b._count.comments) * direction;
        return diff !== 0 ? diff : a.title.localeCompare(b.title);
      });
      return results.slice(
        pagination.pageIndex * pagination.pageSize,
        (pagination.pageIndex + 1) * pagination.pageSize,
      );
    }

    return results;
  }

  async proposals() {
    return db.proposal.findMany({
      include: {
        speakers: this.options.withSpeakers,
        reviews: this.options.withReviews,
        formats: true,
        categories: true,
        tags: true,
      },
      where: this.whereClause(),
      orderBy: this.orderByClause(),
    });
  }

  async proposalIds() {
    const proposals = await db.proposal.findMany({
      select: { id: true },
      where: this.whereClause(),
      orderBy: this.orderByClause(),
    });
    return proposals.map(({ id }) => id);
  }

  async proposalRouteIds() {
    const proposals = await db.proposal.findMany({
      select: { id: true, routeId: true },
      where: this.whereClause(),
      orderBy: this.orderByClause(),
    });
    return proposals.map(({ id, routeId }) => ({ id, routeId }));
  }

  /// Private methods

  private async countReviewComments(proposalIds: Array<string>): Promise<Map<string, number>> {
    if (proposalIds.length === 0) return new Map();

    const counts = await db.$queryRaw<Array<{ proposalId: string; count: bigint }>>(
      Prisma.sql`
        SELECT c."proposalId", COUNT(cm.id)::bigint AS count
        FROM conversations c
        INNER JOIN conversation_messages cm ON cm."conversationId" = c.id
        WHERE c."proposalId" IN (${Prisma.join(proposalIds)})
          AND c."contextType" = 'PROPOSAL_REVIEW_COMMENTS'
        GROUP BY c."proposalId"
      `,
    );

    return new Map(counts.map((row) => [row.proposalId, Number(row.count)]));
  }

  private count() {
    return db.proposal.count({ where: this.whereClause() });
  }

  private countUserReviews() {
    return db.review.count({
      where: { proposal: this.whereClause(), userId: this.userId },
    });
  }

  private whereClause(): ProposalWhereInput {
    const { query, reviews, formats, categories, tags, speakers, status } = this.filters;
    return {
      eventId: this.eventId,
      isDraft: false,
      formats: formats ? { some: { id: formats } } : undefined,
      categories: categories ? { some: { id: categories } } : undefined,
      tags: tags ? { some: { id: tags } } : undefined,
      speakers: speakers ? { some: { id: speakers } } : undefined,
      reviews: this.reviewsClause(reviews),
      OR: this.whereSearchClause(query),
      ...this.whereStatus(status),
      ...this.whereArchived(status),
    };
  }

  private whereStatus(status?: StatusFilter): ProposalWhereInput {
    if (status === 'pending') return { deliberationStatus: 'PENDING' };
    if (status === 'accepted') return { deliberationStatus: 'ACCEPTED' };
    if (status === 'rejected') return { deliberationStatus: 'REJECTED' };
    if (status === 'not-answered') return { deliberationStatus: 'ACCEPTED', confirmationStatus: 'PENDING' };
    if (status === 'confirmed') return { deliberationStatus: 'ACCEPTED', confirmationStatus: 'CONFIRMED' };
    if (status === 'declined') return { deliberationStatus: 'ACCEPTED', confirmationStatus: 'DECLINED' };
    return {};
  }

  private whereArchived(status?: StatusFilter): ProposalWhereInput {
    if (status === 'archived') return { archivedAt: { not: null } };
    return { archivedAt: null };
  }

  private parseSearchQuery(query?: string): QueryParseResult {
    const trimmedQuery = query?.trim();
    if (!trimmedQuery) return { type: 'empty' };

    const withoutHash = trimmedQuery.startsWith('#') ? trimmedQuery.slice(1) : trimmedQuery;
    if (/^\d+$/.test(withoutHash)) {
      return { type: 'proposal-number', number: Number(withoutHash) };
    }
    return { type: 'text-search', query: trimmedQuery };
  }

  private whereSearchClause(query?: string) {
    const parsed = this.parseSearchQuery(query);
    if (parsed.type === 'empty') return undefined;

    const searchValue = parsed.type === 'proposal-number' ? String(parsed.number) : parsed.query;
    const clauses: ProposalWhereInput[] = [];

    if (parsed.type === 'proposal-number') {
      clauses.push({ proposalNumber: parsed.number });
    }
    clauses.push({ title: { contains: searchValue, mode: 'insensitive' } });

    if (this.options.withSpeakers) {
      clauses.push({ speakers: { some: { name: { contains: searchValue, mode: 'insensitive' } } } });
    }
    return clauses;
  }

  private reviewsClause(reviews?: ReviewsFilter): ReviewListRelationFilter | undefined {
    if (!reviews) return undefined;
    if (reviews === 'reviewed') return { some: { userId: this.userId } };
    if (reviews === 'not-reviewed') return { none: { userId: this.userId } };
    if (reviews === 'my-favorites') return { some: { userId: this.userId, feeling: 'POSITIVE' } };
  }

  private orderByClause(): ProposalOrderByWithRelationInput[] {
    switch (this.filters.sort) {
      case 'highest':
        return [{ avgRateForSort: { sort: 'desc', nulls: 'last' } }, { title: 'asc' }];
      case 'lowest':
        return [{ avgRateForSort: { sort: 'asc', nulls: 'first' } }, { title: 'asc' }];
      case 'oldest':
        return [{ submittedAt: 'asc' }, { title: 'asc' }];
      default:
        return [{ submittedAt: 'desc' }, { title: 'asc' }];
    }
  }
}
