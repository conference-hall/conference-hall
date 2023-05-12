import { TeamRole } from '@prisma/client';
import type { ProposalsFilters } from '~/schemas/proposal';
import { allowedForEvent } from '~/shared-server/teams/check-user-role.server';
import { RatingsDetails } from '~/shared-server/ratings/ratings-details';
import { EventProposalsSearch } from '~/shared-server/proposals/EventProposalsSearch';
import type { UserSocialLinks } from '~/schemas/user';

export async function exportProposals(eventSlug: string, userId: string, filters: ProposalsFilters) {
  const event = await allowedForEvent(eventSlug, userId, [TeamRole.OWNER, TeamRole.MEMBER]);

  const options = { searchBySpeakers: event.displayProposalsSpeakers };

  const search = new EventProposalsSearch(eventSlug, userId, filters, options);

  const proposals = await search.proposals({ ratings: event.displayProposalsRatings });

  return proposals.map((proposal) => {
    const ratings = new RatingsDetails(proposal.ratings);
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
      ratings: event.displayProposalsRatings ? ratings.summary() : undefined,
    };
  });
}
