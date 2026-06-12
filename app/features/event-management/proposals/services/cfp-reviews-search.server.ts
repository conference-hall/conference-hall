import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { Pagination } from '~/shared/pagination/pagination.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { Prisma } from '../../../../../prisma/generated/client.ts';
import type { ProposalsFilters } from './proposal-search-builder.schema.server.ts';
import { ProposalSearchBuilder } from './proposal-search-builder.server.ts';

export class CfpReviewsSearch {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new CfpReviewsSearch(authorizedEvent);
  }

  async search(filters: ProposalsFilters, page = 1) {
    const { event, userId } = this.authorizedEvent;

    const search = new ProposalSearchBuilder(event.id, userId, filters, {
      withSpeakers: event.displayProposalsSpeakers,
      withReviews: true,
      withMessages: true,
    });
    const [statistics, hasNewMessages] = await Promise.all([search.statistics(), this.hasNewMessages()]);
    const pagination = new Pagination({ page, total: statistics.total });
    const proposals = await search.proposalsByPage(pagination);

    return {
      filters,
      statistics: { ...statistics, hasNewMessages },
      pagination: { current: pagination.page, total: pagination.pageCount },
      results: proposals.map((proposal) => ({
        id: proposal.id,
        routeId: proposal.routeId,
        title: proposal.title,
        deliberationStatus: proposal.deliberationStatus,
        publicationStatus: proposal.publicationStatus,
        confirmationStatus: proposal.confirmationStatus,
        archivedAt: proposal.archivedAt,
        submittedAt: proposal.submittedAt,
        speakers: event.displayProposalsSpeakers
          ? proposal.speakers.map(({ name, picture }) => ({ name, picture }))
          : [],
        tags: proposal.tags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color })),
        reviews: {
          summary: event.displayProposalsReviews ? proposal.reviews.summary : undefined,
          you: proposal.reviews.you,
        },
        commentCount: proposal.commentCount,
        hasNewMessages: proposal.hasNewMessages,
      })),
    };
  }

  private async hasNewMessages(): Promise<boolean> {
    const { event, userId } = this.authorizedEvent;
    const rows = await db.$queryRaw<Array<{ exists: boolean }>>(
      Prisma.sql`
        SELECT EXISTS (
          SELECT 1
          FROM conversations c
          INNER JOIN proposals p ON p.id = c."proposalId"
            AND p."isDraft" IS FALSE
            AND p."archivedAt" IS NULL
          INNER JOIN conversation_messages cm ON cm."conversationId" = c.id
          LEFT JOIN conversation_participants cp ON cp."conversationId" = c.id AND cp."userId" = ${userId}
          WHERE c."eventId" = ${event.id}
            AND cm."senderId" != ${userId}
            AND (
              (
                c."type" = 'PROPOSAL_SPEAKER_CONVERSATION'
                AND (cp.id IS NULL OR cp."lastSeenAt" IS NULL OR cm."createdAt" > cp."lastSeenAt")
              )
              OR (
                c."type" = 'PROPOSAL_REVIEW_COMMENTS'
                AND cp.id IS NOT NULL
                AND (cp."lastSeenAt" IS NULL OR cm."createdAt" > cp."lastSeenAt")
              )
            )
        ) AS "exists"
      `,
    );
    return rows[0].exists;
  }

  async autocomplete(filters: ProposalsFilters) {
    const { event, userId } = this.authorizedEvent;

    const search = new ProposalSearchBuilder(event.id, userId, filters, { withSpeakers: true, withReviews: true });
    const pagination = new Pagination({ page: 1, total: 10, pageSize: 5 });
    const proposals = await search.proposalsByPage(pagination);

    return proposals.map((proposal) => {
      return {
        id: proposal.id,
        routeId: proposal.routeId,
        title: proposal.title,
        deliberationStatus: proposal.deliberationStatus,
        confirmationStatus: proposal.confirmationStatus,
        speakers: event.displayProposalsSpeakers
          ? proposal.speakers.map(({ name, picture }) => ({ name, picture }))
          : [],
      };
    });
  }
}
