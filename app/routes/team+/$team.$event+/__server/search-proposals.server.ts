import { EventProposalsSearch } from '~/domains/organizer/proposal-search/EventProposalsSearch';
import { Pagination } from '~/domains/shared/Pagination';
import { ReviewsDetails } from '~/routes/__server/reviews/reviews-details.ts';
import { allowedForEvent } from '~/routes/__server/teams/check-user-role.server.ts';
import type { ProposalsFilters } from '~/routes/__types/proposal.ts';

export async function searchProposals(eventSlug: string, userId: string, filters: ProposalsFilters, page: number = 1) {
  const event = await allowedForEvent(eventSlug, userId);

  const search = new EventProposalsSearch(eventSlug, userId, filters, { withSpeakers: event.displayProposalsSpeakers });

  const statistics = await search.statistics();

  const pagination = new Pagination({ page, total: statistics.total });

  const proposals = await search.proposalsByPage(pagination);

  return {
    filters,
    statistics,
    pagination: { current: pagination.page, total: pagination.pageCount },
    results: proposals.map((proposal) => {
      const reviews = new ReviewsDetails(proposal.reviews);

      return {
        id: proposal.id,
        title: proposal.title,
        status: proposal.status,
        emailAcceptedStatus: proposal.emailAcceptedStatus,
        emailRejectedStatus: proposal.emailRejectedStatus,
        speakers: event.displayProposalsSpeakers ? proposal.speakers.map(({ name }) => name) : [],
        reviews: {
          summary: event.displayProposalsReviews ? reviews.summary() : undefined,
          you: reviews.ofUser(userId),
        },
      };
    }),
  };
}
