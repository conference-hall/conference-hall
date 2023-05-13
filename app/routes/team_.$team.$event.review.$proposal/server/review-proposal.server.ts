import { db } from '~/libs/db';
import { DeliberationDisabledError } from '~/libs/errors';
import type { ProposalReviewData } from '~/schemas/proposal';
import { allowedForEvent } from '~/server/teams/check-user-role.server';

export async function rateProposal(eventSlug: string, proposalId: string, userId: string, data: ProposalReviewData) {
  const event = await allowedForEvent(eventSlug, userId);

  if (!event.reviewEnabled) throw new DeliberationDisabledError();

  await db.review.upsert({
    where: { userId_proposalId: { userId: userId, proposalId } },
    update: data,
    create: { userId: userId, proposalId, ...data },
  });
}
