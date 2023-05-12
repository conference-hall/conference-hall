import type { Pagination } from '~/schemas/pagination';
import type { ProposalsFilters } from '~/schemas/proposal';
import { allowedForEvent } from '~/shared-server/teams/check-user-role.server';
import { getPagination } from '~/shared-server/pagination/pagination.server';
import { EventProposalsSearch } from '~/shared-server/proposals/EventProposalsSearch';
import { RatingsDetails } from '~/shared-server/ratings/ratings-details';

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
      const ratings = new RatingsDetails(proposal.ratings);

      return {
        id: proposal.id,
        title: proposal.title,
        status: proposal.status,
        emailAcceptedStatus: proposal.emailAcceptedStatus,
        emailRejectedStatus: proposal.emailRejectedStatus,
        speakers: event.displayProposalsSpeakers ? proposal.speakers.map(({ name }) => name) : [],
        ratings: {
          summary: event.displayProposalsRatings ? ratings.summary() : undefined,
          you: ratings.ofUser(userId),
        },
      };
    }),
  };
}
