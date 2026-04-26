import type { Pagination } from '~/shared/pagination/pagination.ts';
import type { Languages } from '~/shared/types/proposals.types.ts';
import { db } from '../../../../../prisma/db.server.ts';
import {
  ConfirmationStatus,
  DeliberationStatus,
  Prisma,
  PublicationStatus,
  ReviewFeeling,
  TalkLevel,
} from '../../../../../prisma/generated/client.ts';
import type { ProposalsFilters, ReviewsFilter, StatusFilter } from './proposal-search-builder.schema.server.ts';

type SearchOptions = { withSpeakers: boolean; withReviews: boolean };

type QueryParseResult =
  | { type: 'proposal-number'; number: number }
  | { type: 'text-search'; query: string }
  | { type: 'empty' };

type ProposalRow = {
  id: string;
  routeId: string;
  title: string;
  abstract: string;
  references: string | null;
  level: TalkLevel | null;
  languages: Languages;
  proposalNumber: number | null;
  deliberationStatus: DeliberationStatus;
  publicationStatus: PublicationStatus;
  confirmationStatus: ConfirmationStatus | null;
  archivedAt: Date | null;
  submittedAt: Date;
  avgRating: number | null;
  positiveCount: number;
  negativeCount: number;
  userReviewNote: number | null;
  userReviewFeeling: ReviewFeeling | null;
  commentCount: number;
};

type StatisticsRow = { total: bigint; reviewed: bigint };

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
    const conditions = this.buildWhereConditions();
    const rows = await db.$queryRaw<StatisticsRow[]>(
      Prisma.sql`
        SELECT COUNT(*) AS total, COUNT(r.id) AS reviewed
        FROM proposals p
        LEFT JOIN reviews r ON r."proposalId" = p.id AND r."userId" = ${this.userId}
        WHERE ${Prisma.join(conditions, ' AND ')}
      `,
    );
    const row = rows[0];
    return { total: Number(row.total), reviewed: Number(row.reviewed) };
  }

  async proposalsByPage(pagination: Pagination) {
    const rows = await this.executeMainQuery(pagination);
    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.id);
    const [speakersMap, tagsMap] = await Promise.all([
      this.options.withSpeakers ? this.fetchSpeakers(ids) : new Map(),
      this.fetchTags(ids),
    ]);

    return rows.map((row) => this.mapProposalRow(row, speakersMap, tagsMap));
  }

  async proposals() {
    const rows = await this.executeMainQuery();
    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.id);
    const [speakersMap, tagsMap, formatsMap, categoriesMap] = await Promise.all([
      this.options.withSpeakers ? this.fetchSpeakers(ids) : new Map(),
      this.fetchTags(ids),
      this.fetchFormats(ids),
      this.fetchCategories(ids),
    ]);

    return rows.map((row) => this.mapProposalRow(row, speakersMap, tagsMap, formatsMap, categoriesMap));
  }

  async proposalIds() {
    const conditions = this.buildWhereConditions();
    const orderBy = this.buildOrderByClause();
    const sortJoins = this.buildSortJoins();

    const rows = await db.$queryRaw<Array<{ id: string }>>(
      Prisma.sql`
        SELECT p.id
        FROM proposals p
        ${sortJoins}
        WHERE ${Prisma.join(conditions, ' AND ')}
        ORDER BY ${orderBy}
      `,
    );
    return rows.map(({ id }) => id);
  }

  async proposalRouteIds() {
    const conditions = this.buildWhereConditions();
    const orderBy = this.buildOrderByClause();
    const sortJoins = this.buildSortJoins();

    return db.$queryRaw<Array<{ id: string; routeId: string }>>(
      Prisma.sql`
        SELECT p.id, COALESCE(CAST(p."proposalNumber" AS TEXT), p.id) AS "routeId"
        FROM proposals p
        ${sortJoins}
        WHERE ${Prisma.join(conditions, ' AND ')}
        ORDER BY ${orderBy}
      `,
    );
  }

  /// Private methods

  private async executeMainQuery(pagination?: Pagination) {
    const conditions = this.buildWhereConditions();
    const orderBy = this.buildOrderByClause();

    const needsReviewAgg =
      this.options.withReviews || this.filters.sort === 'highest' || this.filters.sort === 'lowest';
    const reviewAggJoin = needsReviewAgg ? this.buildReviewAggJoin() : Prisma.empty;
    const userReviewJoin = this.options.withReviews ? this.buildUserReviewJoin() : Prisma.empty;
    const commentCountJoin = this.buildCommentCountJoin();
    const reviewSelect = this.buildReviewSelectColumns();

    const limitOffset = pagination
      ? Prisma.sql`LIMIT ${pagination.pageSize} OFFSET ${pagination.pageIndex * pagination.pageSize}`
      : Prisma.empty;

    return db.$queryRaw<ProposalRow[]>(
      Prisma.sql`
        SELECT
          p.id,
          COALESCE(CAST(p."proposalNumber" AS TEXT), p.id) AS "routeId",
          p.title,
          p.abstract,
          p.references,
          p.level,
          p.languages,
          p."proposalNumber",
          p."deliberationStatus",
          p."publicationStatus",
          p."confirmationStatus",
          p."archivedAt",
          p."submittedAt",
          ${reviewSelect},
          COALESCE(comment_count.count, 0)::INTEGER AS "commentCount"
        FROM proposals p
        ${reviewAggJoin}
        ${userReviewJoin}
        ${commentCountJoin}
        WHERE ${Prisma.join(conditions, ' AND ')}
        ORDER BY ${orderBy}
        ${limitOffset}
      `,
    );
  }

  private buildWhereConditions(): Prisma.Sql[] {
    const { query, reviews, formats, categories, tags, speakers, status } = this.filters;
    const conditions: Prisma.Sql[] = [];

    conditions.push(Prisma.sql`p."eventId" = ${this.eventId}`);
    conditions.push(Prisma.sql`p."isDraft" IS FALSE`);

    if (status === 'archived') {
      conditions.push(Prisma.sql`p."archivedAt" IS NOT NULL`);
    } else {
      conditions.push(Prisma.sql`p."archivedAt" IS NULL`);
    }

    const statusCondition = this.buildStatusCondition(status);
    if (statusCondition) conditions.push(statusCondition);

    const searchCondition = this.buildSearchCondition(query);
    if (searchCondition) conditions.push(searchCondition);

    if (formats) {
      conditions.push(
        Prisma.sql`EXISTS (SELECT 1 FROM "_proposals_formats" pf WHERE pf."B" = p.id AND pf."A" = ${formats})`,
      );
    }
    if (categories) {
      conditions.push(
        Prisma.sql`EXISTS (SELECT 1 FROM "_proposals_categories" pc WHERE pc."B" = p.id AND pc."A" = ${categories})`,
      );
    }
    if (tags) {
      conditions.push(
        Prisma.sql`EXISTS (SELECT 1 FROM "_proposal_to_event_proposal_tags" pt WHERE pt."B" = p.id AND pt."A" = ${tags})`,
      );
    }
    if (speakers) {
      conditions.push(
        Prisma.sql`EXISTS (SELECT 1 FROM "_proposals_speakers" ps WHERE ps."B" = p.id AND ps."A" = ${speakers})`,
      );
    }

    const reviewCondition = this.buildReviewFilterCondition(reviews);
    if (reviewCondition) conditions.push(reviewCondition);

    return conditions;
  }

  private buildStatusCondition(status?: StatusFilter): Prisma.Sql | null {
    switch (status) {
      case 'pending':
        return Prisma.sql`p."deliberationStatus" = 'PENDING'`;
      case 'accepted':
        return Prisma.sql`p."deliberationStatus" = 'ACCEPTED'`;
      case 'rejected':
        return Prisma.sql`p."deliberationStatus" = 'REJECTED'`;
      case 'not-answered':
        return Prisma.sql`(p."deliberationStatus" = 'ACCEPTED' AND p."confirmationStatus" = 'PENDING')`;
      case 'confirmed':
        return Prisma.sql`(p."deliberationStatus" = 'ACCEPTED' AND p."confirmationStatus" = 'CONFIRMED')`;
      case 'declined':
        return Prisma.sql`(p."deliberationStatus" = 'ACCEPTED' AND p."confirmationStatus" = 'DECLINED')`;
      default:
        return null;
    }
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

  private buildSearchCondition(query?: string): Prisma.Sql | null {
    const parsed = this.parseSearchQuery(query);
    if (parsed.type === 'empty') return null;

    const searchValue = parsed.type === 'proposal-number' ? String(parsed.number) : parsed.query;
    const clauses: Prisma.Sql[] = [];

    if (parsed.type === 'proposal-number') {
      clauses.push(Prisma.sql`p."proposalNumber" = ${parsed.number}`);
    }
    clauses.push(Prisma.sql`p.title ILIKE ${'%' + searchValue + '%'}`);

    if (this.options.withSpeakers) {
      clauses.push(
        Prisma.sql`EXISTS (
          SELECT 1 FROM "_proposals_speakers" ps
          JOIN event_speakers es ON es.id = ps."A"
          WHERE ps."B" = p.id AND es.name ILIKE ${'%' + searchValue + '%'}
        )`,
      );
    }

    return Prisma.sql`(${Prisma.join(clauses, ' OR ')})`;
  }

  private buildReviewFilterCondition(reviews?: ReviewsFilter): Prisma.Sql | null {
    if (!reviews) return null;
    switch (reviews) {
      case 'reviewed':
        return Prisma.sql`EXISTS (SELECT 1 FROM reviews r WHERE r."proposalId" = p.id AND r."userId" = ${this.userId})`;
      case 'not-reviewed':
        return Prisma.sql`NOT EXISTS (SELECT 1 FROM reviews r WHERE r."proposalId" = p.id AND r."userId" = ${this.userId})`;
      case 'my-favorites':
        return Prisma.sql`EXISTS (SELECT 1 FROM reviews r WHERE r."proposalId" = p.id AND r."userId" = ${this.userId} AND r.feeling = 'POSITIVE')`;
      default:
        return null;
    }
  }

  private buildOrderByClause(): Prisma.Sql {
    switch (this.filters.sort) {
      case 'highest':
        return Prisma.sql`review_agg.avg_rating DESC NULLS LAST, p.title ASC`;
      case 'lowest':
        return Prisma.sql`review_agg.avg_rating ASC NULLS LAST, p.title ASC`;
      case 'oldest':
        return Prisma.sql`p."submittedAt" ASC, p.title ASC`;
      case 'most-comments':
        return Prisma.sql`comment_count.count DESC NULLS LAST, p.title ASC`;
      case 'fewest-comments':
        return Prisma.sql`comment_count.count ASC NULLS LAST, p.title ASC`;
      default:
        return Prisma.sql`p."submittedAt" DESC, p.title ASC`;
    }
  }

  private buildReviewAggJoin(): Prisma.Sql {
    return Prisma.sql`
      LEFT JOIN (
        SELECT "proposalId",
          (AVG(note) FILTER (WHERE feeling != 'NO_OPINION'))::DOUBLE PRECISION AS avg_rating,
          COUNT(*) FILTER (WHERE feeling = 'POSITIVE') AS positive_count,
          COUNT(*) FILTER (WHERE feeling = 'NEGATIVE') AS negative_count
        FROM reviews
        GROUP BY "proposalId"
      ) review_agg ON review_agg."proposalId" = p.id
    `;
  }

  private buildUserReviewJoin(): Prisma.Sql {
    return Prisma.sql`
      LEFT JOIN reviews user_review
        ON user_review."proposalId" = p.id AND user_review."userId" = ${this.userId}
    `;
  }

  private buildCommentCountJoin(): Prisma.Sql {
    return Prisma.sql`
      LEFT JOIN (
        SELECT "proposalId", COUNT(*) AS count
        FROM comments
        GROUP BY "proposalId"
      ) comment_count ON comment_count."proposalId" = p.id
    `;
  }

  private buildSortJoins(): Prisma.Sql {
    const sort = this.filters.sort;
    const parts: Prisma.Sql[] = [];

    if (sort === 'highest' || sort === 'lowest') {
      parts.push(this.buildReviewAggJoin());
    }
    if (sort === 'most-comments' || sort === 'fewest-comments') {
      parts.push(this.buildCommentCountJoin());
    }

    if (parts.length === 0) return Prisma.empty;
    return Prisma.join(parts, ' ');
  }

  private buildReviewSelectColumns(): Prisma.Sql {
    if (this.options.withReviews) {
      return Prisma.sql`
        review_agg.avg_rating AS "avgRating",
        COALESCE(review_agg.positive_count, 0)::INTEGER AS "positiveCount",
        COALESCE(review_agg.negative_count, 0)::INTEGER AS "negativeCount",
        user_review.note AS "userReviewNote",
        user_review.feeling::TEXT AS "userReviewFeeling"
      `;
    }
    return Prisma.sql`
      NULL::DOUBLE PRECISION AS "avgRating",
      0::INTEGER AS "positiveCount",
      0::INTEGER AS "negativeCount",
      NULL::INTEGER AS "userReviewNote",
      NULL::TEXT AS "userReviewFeeling"
    `;
  }

  // Batch-fetch helpers

  private async fetchSpeakers(proposalIds: string[]) {
    const proposals = await db.proposal.findMany({
      where: { id: { in: proposalIds } },
      select: { id: true, speakers: { orderBy: { name: 'asc' } } },
    });
    return new Map(proposals.map((p): [string, typeof p.speakers] => [p.id, p.speakers]));
  }

  private async fetchTags(proposalIds: string[]) {
    const proposals = await db.proposal.findMany({
      where: { id: { in: proposalIds } },
      select: { id: true, tags: { orderBy: { name: 'asc' } } },
    });
    return new Map(proposals.map((p): [string, typeof p.tags] => [p.id, p.tags]));
  }

  private async fetchFormats(proposalIds: string[]) {
    const proposals = await db.proposal.findMany({
      where: { id: { in: proposalIds } },
      select: { id: true, formats: { orderBy: { name: 'asc' } } },
    });
    return new Map(proposals.map((p): [string, typeof p.formats] => [p.id, p.formats]));
  }

  private async fetchCategories(proposalIds: string[]) {
    const proposals = await db.proposal.findMany({
      where: { id: { in: proposalIds } },
      select: { id: true, categories: { orderBy: { name: 'asc' } } },
    });
    return new Map(proposals.map((p): [string, typeof p.categories] => [p.id, p.categories]));
  }

  private mapProposalRow<S, T, F, C>(
    row: ProposalRow,
    speakersMap: Map<string, S[]>,
    tagsMap: Map<string, T[]>,
    formatsMap?: Map<string, F[]>,
    categoriesMap?: Map<string, C[]>,
  ) {
    return {
      id: row.id,
      routeId: row.routeId,
      title: row.title,
      abstract: row.abstract,
      references: row.references,
      level: row.level,
      languages: row.languages,
      proposalNumber: row.proposalNumber,
      deliberationStatus: row.deliberationStatus,
      publicationStatus: row.publicationStatus,
      confirmationStatus: row.confirmationStatus,
      archivedAt: row.archivedAt,
      submittedAt: row.submittedAt,
      speakers: speakersMap.get(row.id) ?? [],
      tags: tagsMap.get(row.id) ?? [],
      formats: formatsMap?.get(row.id) ?? [],
      categories: categoriesMap?.get(row.id) ?? [],
      reviews: {
        summary: this.options.withReviews
          ? { average: row.avgRating, positives: row.positiveCount, negatives: row.negativeCount }
          : undefined,
        you: this.options.withReviews
          ? { note: row.userReviewNote, feeling: row.userReviewFeeling }
          : { note: null, feeling: null },
      },
      comments: { count: row.commentCount },
    };
  }
}
