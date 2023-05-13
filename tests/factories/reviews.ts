import type { Prisma, Proposal, User } from '@prisma/client';
import { db } from '~/libs/db';

type FactoryOptions = {
  user: User;
  proposal: Proposal;
  attributes?: Partial<Prisma.ReviewCreateInput>;
};

export const reviewFactory = (options: FactoryOptions) => {
  const { attributes = {}, user, proposal } = options;

  const defaultAttributes: Prisma.ReviewCreateInput = {
    user: { connect: { id: user.id } },
    proposal: { connect: { id: proposal.id } },
    note: 3,
    feeling: 'NEUTRAL',
  };

  const data = { ...defaultAttributes, ...attributes };
  return db.review.create({ data });
};
