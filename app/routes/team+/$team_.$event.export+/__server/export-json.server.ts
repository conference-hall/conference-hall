import { TeamRole } from '@prisma/client';

import { ProposalSearchBuilder } from '~/domains/organizer-cfp-reviews/proposal-search-builder/ProposalSearchBuilder';
import { ReviewsDetails } from '~/domains/organizer-cfp-reviews/ReviewDetails';
import { allowedForEvent } from '~/routes/__server/teams/check-user-role.server.ts';
import type { ProposalsFilters } from '~/routes/__types/proposal.ts';
import type { UserSocialLinks } from '~/routes/__types/user.ts';

export async function exportProposals(eventSlug: string, userId: string, filters: ProposalsFilters) {
  const event = await allowedForEvent(eventSlug, userId, [TeamRole.OWNER, TeamRole.MEMBER]);

  const search = new ProposalSearchBuilder(eventSlug, userId, filters, {
    withSpeakers: event.displayProposalsSpeakers,
  });

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
