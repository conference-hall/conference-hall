import type { Proposal, User } from 'prisma/generated/client.ts';
import { ReviewFeeling } from 'prisma/generated/client.ts';
import type { ReviewCreateInput } from 'prisma/generated/models.ts';
import { ReviewDetails } from '../../app/features/event-management/proposals/models/review-details.ts';
import { db } from '../../prisma/db.server.ts';

type FactoryOptions = {
  user: User;
  proposal: Proposal;
  attributes?: Partial<ReviewCreateInput>;
};

export const reviewFactory = async (options: FactoryOptions) => {
  const { attributes = {}, user, proposal } = options;

  const defaultAttributes: ReviewCreateInput = {
    user: { connect: { id: user.id } },
    proposal: { connect: { id: proposal.id } },
    note: 3,
    feeling: 'NEUTRAL',
  };

  const data = { ...defaultAttributes, ...attributes };

  const review = await db.review.create({ data });

  // compute review average on proposal
  const reviews = await db.review.findMany({
    where: { proposalId: proposal.id, feeling: { not: ReviewFeeling.NO_OPINION } },
  });
  const reviewsDetails = new ReviewDetails(reviews);
  const average = reviewsDetails.summary().average ?? undefined;
  await db.proposal.update({ where: { id: proposal.id }, data: { avgRateForSort: average } });

  return review;
};
