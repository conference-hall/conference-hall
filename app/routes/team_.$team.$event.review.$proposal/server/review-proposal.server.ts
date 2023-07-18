import { ReviewFeeling } from '@prisma/client';

import { db } from '~/libs/db';
import { DeliberationDisabledError } from '~/libs/errors';
import type { ProposalReviewData } from '~/schemas/proposal';
import { ReviewsDetails } from '~/server/reviews/reviews-details';
import { allowedForEvent } from '~/server/teams/check-user-role.server';

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
