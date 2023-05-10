import { db } from '~/libs/db';
import { allowedForEvent } from '~/shared-server/organizations/check-user-role.server';
import { RatingsDetails } from '~/shared-server/ratings/ratings-details';

export async function getReviews(eventSlug: string, proposalId: string, userId: string) {
  const event = await allowedForEvent(eventSlug, userId);

  const result = await db.rating.findMany({ where: { proposalId }, include: { user: true } });

  const reviews = new RatingsDetails(result);

  return {
    summary: event.displayProposalsRatings ? reviews.summary() : undefined,
    reviews: event.displayProposalsRatings ? reviews.ofMembers() : [],
  };
}
