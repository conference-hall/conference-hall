import { OrganizationRole } from '@prisma/client';
import type { ProposalsFilters } from '~/schemas/proposal';
import { db } from '../../libs/db';
import { checkUserRole } from '~/shared/organizations/check-user-role.server';
import { proposalOrderBy, proposalWhereInput } from '../organizer.$orga.$event._index/search-proposals.server';
import { RatingsDetails } from '~/shared/ratings/ratings-details';

export async function exportProposals(orgaSlug: string, eventSlug: string, uid: string, filters: ProposalsFilters) {
  await checkUserRole(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER, OrganizationRole.MEMBER]);

  const whereClause = proposalWhereInput(eventSlug, uid, filters);
  const orderByClause = proposalOrderBy(filters);
  const proposals = await db.proposal.findMany({
    include: { speakers: true, ratings: true, categories: true, formats: true },
    where: whereClause,
    orderBy: orderByClause,
  });

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
