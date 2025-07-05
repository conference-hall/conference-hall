import { Pagination } from '~/shared/pagination/pagination.ts';
import { UserEventAuthorization } from '~/shared/user/user-event-authorization.server.ts';
import { sortBy } from '~/shared/utils/arrays-sort-by.ts';
import { ReviewDetails } from '../models/review-details.ts';
import type { ProposalsFilters } from './proposal-search-builder.schema.server.ts';
import { ProposalSearchBuilder } from './proposal-search-builder.server.ts';

export class CfpReviewsSearch extends UserEventAuthorization {
  static for(userId: string, team: string, event: string) {
    return new CfpReviewsSearch(userId, team, event);
  }

  async search(filters: ProposalsFilters, page = 1) {
    const event = await this.needsPermission('canAccessEvent');

    const search = new ProposalSearchBuilder(event.slug, this.userId, filters, {
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
      results: proposals.map((proposal) => {
        const reviews = new ReviewDetails(proposal.reviews);

        return {
          id: proposal.id,
          title: proposal.title,
          deliberationStatus: proposal.deliberationStatus,
          publicationStatus: proposal.publicationStatus,
          confirmationStatus: proposal.confirmationStatus,
          createdAt: proposal.createdAt,
          speakers: event.displayProposalsSpeakers
            ? proposal.speakers.map(({ name, picture }) => ({ name, picture }))
            : [],
          tags: sortBy(
            proposal.tags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color })),
            'name',
          ),
          reviews: {
            summary: event.displayProposalsReviews ? reviews.summary() : undefined,
            you: reviews.ofUser(this.userId),
          },
          comments: {
            count: proposal._count.comments,
          },
        };
      }),
    };
  }

  async autocomplete(filters: ProposalsFilters) {
    const event = await this.needsPermission('canAccessEvent');

    const search = new ProposalSearchBuilder(event.slug, this.userId, filters, {
      withSpeakers: true,
      withReviews: true,
    });
    const pagination = new Pagination({ page: 1, total: 10, pageSize: 5 });
    const proposals = await search.proposalsByPage(pagination);

    return proposals.map((proposal) => {
      return {
        id: proposal.id,
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
