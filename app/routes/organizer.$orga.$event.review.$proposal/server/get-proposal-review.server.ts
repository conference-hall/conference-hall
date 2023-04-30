import type { ProposalsFilters } from '~/schemas/proposal';
import { jsonToArray } from '~/libs/prisma';
import { allowedForEvent } from '~/shared-server/organizations/check-user-role.server';
import { RatingsDetails } from '~/shared-server/ratings/ratings-details';
import { OrganizerProposalsSearch } from '~/shared-server/proposals/OrganizerProposalsSearch';
import { db } from '~/libs/db';
import { ProposalNotFoundError } from '~/libs/errors';
import { sortBy } from '~/utils/arrays';
import type { UserSocialLinks } from '~/schemas/user';

export type ProposalReview = Awaited<ReturnType<typeof getProposalReview>>;

export async function getProposalReview(
  eventSlug: string,
  proposalId: string,
  userId: string,
  filters: ProposalsFilters
) {
  await allowedForEvent(eventSlug, userId);

  const search = new OrganizerProposalsSearch(eventSlug, userId, filters);
  const proposalIds = await search.proposalsIds();

  const totalProposals = proposalIds.length;
  const curIndex = proposalIds.findIndex((id) => id === proposalId);
  const previousId = proposalIds.at(curIndex - 1);
  const nextId = curIndex + 1 >= totalProposals ? proposalIds.at(0) : proposalIds.at(curIndex + 1);

  const proposal = await db.proposal.findFirst({
    include: {
      speakers: true,
      formats: true,
      categories: true,
      ratings: { include: { user: true } },
      messages: { include: { user: true } },
    },
    where: { id: proposalId },
  });
  if (!proposal) throw new ProposalNotFoundError();

  const ratingDetails = new RatingsDetails(proposal.ratings);
  const userRating = ratingDetails.fromUser(userId);

  return {
    pagination: {
      total: totalProposals,
      current: curIndex + 1,
      previousId,
      nextId,
    },
    proposal: {
      title: proposal.title,
      abstract: proposal.abstract,
      references: proposal.references,
      comments: proposal.comments,
      level: proposal.level,
      languages: jsonToArray(proposal.languages),
      formats: proposal.formats.map(({ id, name }) => ({ id, name })),
      categories: proposal.categories.map(({ id, name }) => ({ id, name })),
      speakers: proposal.speakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        picture: speaker.picture,
        bio: speaker.bio,
        references: speaker.references,
        email: speaker.email,
        company: speaker.company,
        address: speaker.address,
        socials: speaker.socials as UserSocialLinks,
      })),
      rating: {
        average: ratingDetails.average,
        positives: ratingDetails.positives,
        negatives: ratingDetails.negatives,
        userRating: {
          rating: userRating?.rating,
          feeling: userRating?.feeling,
        },
        membersRatings: sortBy(
          proposal.ratings.map((rating) => ({
            id: rating.user.id,
            name: rating.user.name,
            picture: rating.user.picture,
            rating: rating.rating,
            feeling: rating.feeling,
          })),
          'name'
        ),
      },
      messages: proposal.messages
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((message) => ({
          id: message.id,
          userId: message.userId,
          name: message.user.name,
          picture: message.user.picture,
          message: message.message,
        })),
    },
  };
}
