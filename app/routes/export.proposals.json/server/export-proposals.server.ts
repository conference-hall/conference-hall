import { OrganizationRole } from '@prisma/client';
import type { ProposalsFilters } from '~/schemas/proposal';
import { checkUserRole } from '~/shared-server/organizations/check-user-role.server';
import { RatingsDetails } from '~/shared-server/ratings/ratings-details';
import { EventProposalsSearch } from '~/shared-server/proposals/EventProposalsSearch';

export async function exportProposals(orgaSlug: string, eventSlug: string, uid: string, filters: ProposalsFilters) {
  await checkUserRole(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER, OrganizationRole.MEMBER]);

  const search = new EventProposalsSearch(eventSlug, uid, filters);

  const proposals = await search.proposals();

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
      speakers: proposal.speakers.map((speaker) => ({
        name: speaker.name,
        bio: speaker.bio,
        company: speaker.company,
        references: speaker.references,
        photoURL: speaker.photoURL,
        github: speaker.github,
        twitter: speaker.twitter,
        address: speaker.address,
        email: speaker.email,
      })),
      ratings: {
        positives: ratings.positives,
        negatives: ratings.negatives,
        total: ratings.average,
      },
    };
  });
}
