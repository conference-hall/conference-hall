import { ReviewFeeling } from '@prisma/client';

import { ReviewsDetails } from '~/domains/organizer-cfp-reviews/ReviewDetails';
import { db } from '~/libs/db.ts';
import { DeliberationDisabledError } from '~/libs/errors.ts';
import { allowedForEvent } from '~/routes/__server/teams/check-user-role.server.ts';
import type { ProposalReviewData } from '~/routes/__types/proposal.ts';

export async function rateProposal(eventSlug: string, proposalId: string, userId: string, data: ProposalReviewData) {
  const event = await allowedForEvent(eventSlug, userId);

  if (!event.reviewEnabled) throw new DeliberationDisabledError();

  await db.$transaction(async (trx) => {
    await db.review.upsert({
      where: { userId_proposalId: { userId: userId, proposalId } },
      update: data,
      create: { userId: userId, proposalId, ...data },
    });

    const reviews = await trx.review.findMany({
      where: { proposalId, feeling: { not: ReviewFeeling.NO_OPINION } },
    });

    const reviewsDetails = new ReviewsDetails(reviews);

    const average = reviewsDetails.summary().average ?? undefined;

    await trx.proposal.update({ where: { id: proposalId }, data: { avgRateForSort: average } });
  });
}
