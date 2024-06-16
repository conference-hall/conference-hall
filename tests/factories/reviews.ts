import { type Prisma, type Proposal, ReviewFeeling, type User } from '@prisma/client';

import { ReviewDetails } from '../../app/.server/reviews/ReviewDetails.ts';
import { db } from '../../prisma/db.server.ts';

type FactoryOptions = {
  user: User;
  proposal: Proposal;
  attributes?: Partial<Prisma.ReviewCreateInput>;
};

export const reviewFactory = async (options: FactoryOptions) => {
  const { attributes = {}, user, proposal } = options;

  const defaultAttributes: Prisma.ReviewCreateInput = {
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
