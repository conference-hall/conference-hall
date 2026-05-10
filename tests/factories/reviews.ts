import { db } from '../../prisma/db.server.ts';
import type { Proposal, User } from '../../prisma/generated/client.ts';
import type { ReviewCreateInput } from '../../prisma/generated/models.ts';

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

  return db.review.create({ data });
};
