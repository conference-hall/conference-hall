import { TeamRole } from '@prisma/client';

import { EventProposalsSearch } from '~/routes/__server/proposals/EventProposalsSearch';
import { ReviewsDetails } from '~/routes/__server/reviews/reviews-details';
import { allowedForEvent } from '~/routes/__server/teams/check-user-role.server';
import type { ProposalsFilters } from '~/routes/__types/proposal';
import type { UserSocialLinks } from '~/routes/__types/user';

export async function exportProposals(eventSlug: string, userId: string, filters: ProposalsFilters) {
  const event = await allowedForEvent(eventSlug, userId, [TeamRole.OWNER, TeamRole.MEMBER]);

  const options = { searchBySpeakers: event.displayProposalsSpeakers };

  const search = new EventProposalsSearch(eventSlug, userId, filters, options);

  const proposals = await search.proposals({ reviews: event.displayProposalsReviews });

  return proposals.map((proposal) => {
    const reviews = new ReviewsDetails(proposal.reviews);
    return {
      id: proposal.id,
      title: proposal.title,
      abstract: proposal.abstract,
      status: proposal.status,
      level: proposal.level,
      comments: proposal.comments,
      references: proposal.references,
      formats: proposal.formats,
      categories: proposal.categories,
      languages: proposal.languages,
      speakers: event.displayProposalsSpeakers
        ? proposal.speakers.map((speaker) => ({
            name: speaker.name,
            bio: speaker.bio,
            company: speaker.company,
            references: speaker.references,
            picture: speaker.picture,
            address: speaker.address,
            email: speaker.email,
            socials: speaker.socials as UserSocialLinks,
          }))
        : undefined,
      reviews: event.displayProposalsReviews ? reviews.summary() : undefined,
    };
  });
}
