import { UserEvent } from '../event-settings/user-event.ts';
import { Pagination } from '../shared/pagination.ts';
import { ProposalSearchBuilder } from '../shared/proposal-search-builder.ts';
import type { ProposalsFilters } from '../shared/proposal-search-builder.types.ts';
import { ReviewDetails } from './review-details.ts';

export class CfpReviewsSearch {
  constructor(
    private userId: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new CfpReviewsSearch(userId, userEvent);
  }

  async search(filters: ProposalsFilters, page = 1) {
    const event = await this.userEvent.needsPermission('canAccessEvent');

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
          speakers: event.displayProposalsSpeakers
            ? proposal.speakers.map(({ name, picture }) => ({ name, picture }))
            : [],
          reviews: {
            summary: event.displayProposalsReviews ? reviews.summary() : undefined,
            you: reviews.ofUser(this.userId),
          },
        };
      }),
    };
  }

  async autocomplete(filters: ProposalsFilters) {
    const event = await this.userEvent.needsPermission('canAccessEvent');

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
