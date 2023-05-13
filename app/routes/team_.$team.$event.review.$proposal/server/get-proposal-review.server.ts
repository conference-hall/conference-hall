import { db } from '~/libs/db';
import { ProposalNotFoundError } from '~/libs/errors';
import { jsonToArray } from '~/libs/prisma';
import type { ProposalsFilters } from '~/schemas/proposal';
import { EventProposalsSearch } from '~/server/proposals/EventProposalsSearch';
import { ReviewsDetails } from '~/server/reviews/reviews-details';
import { allowedForEvent } from '~/server/teams/check-user-role.server';

export type ProposalReview = Awaited<ReturnType<typeof getProposalReview>>;

export async function getProposalReview(
  eventSlug: string,
  proposalId: string,
  userId: string,
  filters: ProposalsFilters
) {
  const event = await allowedForEvent(eventSlug, userId);

  const options = { searchBySpeakers: event.displayProposalsSpeakers };

  const search = new EventProposalsSearch(eventSlug, userId, filters, options);
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
      reviews: true,
      _count: { select: { reviews: true, messages: true } },
    },
    where: { id: proposalId },
  });
  if (!proposal) throw new ProposalNotFoundError();

  const reviews = new ReviewsDetails(proposal.reviews);

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
        you: reviews.ofUser(userId),
        summary: event.displayProposalsReviews ? reviews.summary() : undefined,
      },
      reviewsCount: proposal._count.reviews,
      messagesCount: proposal._count.messages,
    },
    reviewEnabled: event.reviewEnabled,
    pagination: {
      total: totalProposals,
      current: curIndex + 1,
      previousId,
      nextId,
    },
  };
}
