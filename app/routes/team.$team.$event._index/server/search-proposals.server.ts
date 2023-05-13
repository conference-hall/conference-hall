import type { Pagination } from '~/schemas/pagination';
import type { ProposalsFilters } from '~/schemas/proposal';
import { allowedForEvent } from '~/server/teams/check-user-role.server';
import { getPagination } from '~/server/pagination/pagination.server';
import { EventProposalsSearch } from '~/server/proposals/EventProposalsSearch';
import { ReviewsDetails } from '~/server/reviews/reviews-details';

const RESULTS_BY_PAGE = 25;

export async function searchProposals(
  eventSlug: string,
  userId: string,
  filters: ProposalsFilters,
  page: Pagination = 1
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
