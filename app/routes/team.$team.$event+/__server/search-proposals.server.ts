import { getPagination } from '~/routes/__server/pagination/pagination.server.ts';
import { EventProposalsSearch } from '~/routes/__server/proposals/EventProposalsSearch.ts';
import { ReviewsDetails } from '~/routes/__server/reviews/reviews-details.ts';
import { allowedForEvent } from '~/routes/__server/teams/check-user-role.server.ts';
import type { Pagination } from '~/routes/__types/pagination.ts';
import type { ProposalsFilters } from '~/routes/__types/proposal.ts';

const RESULTS_BY_PAGE = 25;

export async function searchProposals(
  eventSlug: string,
  userId: string,
  filters: ProposalsFilters,
  page: Pagination = 1,
) {
  const event = await allowedForEvent(eventSlug, userId);

  const options = { searchBySpeakers: event.displayProposalsSpeakers };

  const search = new EventProposalsSearch(eventSlug, userId, filters, options);

  const statistics = await search.statistics();

  const { pageIndex, currentPage, totalPages } = getPagination(page, statistics.total, RESULTS_BY_PAGE);

  const proposals = await search.proposalsByPage(pageIndex, RESULTS_BY_PAGE);

  return {
    filters,
    statistics,
    pagination: { current: currentPage, total: totalPages },
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
