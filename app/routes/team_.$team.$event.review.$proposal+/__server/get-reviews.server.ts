import { db } from '~/libs/db.ts';
import { ForbiddenOperationError } from '~/libs/errors.ts';
import { ReviewsDetails } from '~/routes/__server/reviews/reviews-details.ts';
import { allowedForEvent } from '~/routes/__server/teams/check-user-role.server.ts';

export async function getReviews(eventSlug: string, proposalId: string, userId: string) {
  const event = await allowedForEvent(eventSlug, userId);

  if (!event.displayProposalsReviews) throw new ForbiddenOperationError();

  const result = await db.review.findMany({ where: { proposalId }, include: { user: true } });

  const reviews = new ReviewsDetails(result);

  return reviews.ofMembers();
}
