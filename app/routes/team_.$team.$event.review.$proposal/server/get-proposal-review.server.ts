import type { ProposalsFilters } from '~/schemas/proposal';
import { jsonToArray } from '~/libs/prisma';
import { allowedForEvent } from '~/shared-server/organizations/check-user-role.server';
import { RatingsDetails } from '~/shared-server/ratings/ratings-details';
import { OrganizerProposalsSearch } from '~/shared-server/proposals/OrganizerProposalsSearch';
import { db } from '~/libs/db';
import { ProposalNotFoundError } from '~/libs/errors';

export type ProposalReview = Awaited<ReturnType<typeof getProposalReview>>;

export async function getProposalReview(
  eventSlug: string,
  proposalId: string,
  userId: string,
  filters: ProposalsFilters
) {
  const event = await allowedForEvent(eventSlug, userId);

  const options = { searchBySpeakers: event.displayProposalsSpeakers };

  const search = new OrganizerProposalsSearch(eventSlug, userId, filters, options);
  const proposalIds = await search.proposalsIds();

  const totalProposals = proposalIds.length;
  const curIndex = proposalIds.findIndex((id) => id === proposalId);
  const previousId = proposalIds.at(curIndex - 1);
  const nextId = curIndex + 1 >= totalProposals ? proposalIds.at(0) : proposalIds.at(curIndex + 1);

  const proposal = await db.proposal.findFirst({
    include: {
      speakers: event.displayProposalsSpeakers,
      formats: true,
      categories: true,
      ratings: true,
      _count: { select: { ratings: true, messages: true } },
    },
    where: { id: proposalId },
  });
  if (!proposal) throw new ProposalNotFoundError();

  const ratings = new RatingsDetails(proposal.ratings);

  return {
    proposal: {
      id: proposal.id,
      title: proposal.title,
      abstract: proposal.abstract,
      references: proposal.references,
      comments: proposal.comments,
      level: proposal.level,
      status: proposal.status,
      createdAt: proposal.createdAt.toUTCString(),
      languages: jsonToArray(proposal.languages),
      formats: proposal.formats.map(({ id, name }) => ({ id, name })),
      categories: proposal.categories.map(({ id, name }) => ({ id, name })),
      speakers: event.displayProposalsSpeakers
        ? proposal.speakers.map((speaker) => ({
            id: speaker.id,
            name: speaker.name,
            picture: speaker.picture,
          }))
        : [],
      reviews: {
        you: ratings.ofUser(userId),
        summary: event.displayProposalsRatings ? ratings.summary() : undefined,
      },
      reviewsCount: proposal._count.ratings,
      messagesCount: proposal._count.messages,
    },
    deliberationEnabled: event.deliberationEnabled,
    pagination: {
      total: totalProposals,
      current: curIndex + 1,
      previousId,
      nextId,
    },
  };
}
