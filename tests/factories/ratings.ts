import type { Prisma, Proposal, User } from '@prisma/client';
import { db } from '../../app/libs/db';

type FactoryOptions = {
  user: User;
  proposal: Proposal;
  attributes?: Partial<Prisma.RatingCreateInput>;
};

export const ratingFactory = (options: FactoryOptions) => {
  const { attributes = {}, user, proposal } = options;

  const defaultAttributes: Prisma.RatingCreateInput = {
    user: { connect: { id: user.id } },
    proposal: { connect: { id: proposal.id } },
    rating: 3,
    feeling: 'NEUTRAL',
  };

  const data = { ...defaultAttributes, ...attributes };
  return db.rating.create({ data });
};
