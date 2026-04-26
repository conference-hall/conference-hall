import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { Pagination } from '~/shared/pagination/pagination.ts';
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
    });
    const statistics = await search.statistics();
    const pagination = new Pagination({ page, total: statistics.total });
    const proposals = await search.proposalsByPage(pagination);

    return {
      filters,
      statistics,
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
        comments: proposal.comments,
      })),
    };
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
