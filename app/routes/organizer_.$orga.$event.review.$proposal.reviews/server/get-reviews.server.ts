import { db } from '~/libs/db';
import { ForbiddenOperationError } from '~/libs/errors';
import { allowedForEvent } from '~/shared-server/organizations/check-user-role.server';
import { RatingsDetails } from '~/shared-server/ratings/ratings-details';

export async function getReviews(eventSlug: string, proposalId: string, userId: string) {
  const event = await allowedForEvent(eventSlug, userId);

  if (!event.displayProposalsRatings) throw new ForbiddenOperationError();

  const result = await db.rating.findMany({ where: { proposalId }, include: { user: true } });

  const reviews = new RatingsDetails(result);

  return reviews.ofMembers();
}
