import { TeamRole } from '@prisma/client';

import { EventProposalsSearch } from '~/domains/organizer-cfp-reviews/EventProposalsSearch';
import { ReviewsDetails } from '~/domains/organizer-cfp-reviews/ReviewDetails';
import { jsonToArray } from '~/libs/prisma.ts';
import { allowedForEvent } from '~/routes/__server/teams/check-user-role.server.ts';
import type { ProposalsFilters } from '~/routes/__types/proposal.ts';

export async function exportProposals(eventSlug: string, userId: string, filters: ProposalsFilters) {
  const event = await allowedForEvent(eventSlug, userId, [TeamRole.OWNER, TeamRole.MEMBER]);

  const search = new EventProposalsSearch(eventSlug, userId, filters, { withSpeakers: event.displayProposalsSpeakers });

  const proposals = await search.proposals({ reviews: event.displayProposalsReviews });

  return proposals.map((proposal) => {
    const reviews = new ReviewsDetails(proposal.reviews);

    return {
      id: proposal.id,
      title: proposal.title,
      level: proposal.level,
      formats: proposal.formats,
      categories: proposal.categories,
      languages: jsonToArray(proposal.languages),
      speakers: event.displayProposalsSpeakers ? proposal.speakers.map((speaker) => speaker.name) : undefined,
      reviews: event.displayProposalsReviews ? reviews.summary() : undefined,
    };
  });
}
