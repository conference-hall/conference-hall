import type { Prisma, Proposal, Review, User } from '../../index.ts';
import { db, ReviewFeeling } from '../../index.ts';

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
  const average = computeAverage(reviews);
  await db.proposal.update({ where: { id: proposal.id }, data: { avgRateForSort: average } });

  return review;
};

function computeAverage(reviews: Array<Review>) {
  const rates = reviews
    .filter((r) => r.feeling !== 'NO_OPINION' && r.note !== null)
    .map((r) => r.note || 0)
    .filter((r) => r !== null);

  if (rates.length === 0) return null;

  return rates.reduce((acc, next) => acc + next, 0) / rates.length;
}
