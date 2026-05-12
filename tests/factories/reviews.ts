import { db } from '../../prisma/db.server.ts';
import type { Proposal, User } from '../../prisma/generated/client.ts';
import type { ReviewCreateInput } from '../../prisma/generated/models.ts';

const TRAITS = {
  dismissed: { dismissedAt: new Date('2024-01-01') },
};

type Trait = keyof typeof TRAITS;

type FactoryOptions = {
  user: User;
  proposal: Proposal;
  attributes?: Partial<ReviewCreateInput>;
  traits?: Trait[];
};

export const reviewFactory = async (options: FactoryOptions) => {
  const { attributes = {}, traits = [], user, proposal } = options;

  const defaultAttributes: ReviewCreateInput = {
    user: { connect: { id: user.id } },
    proposal: { connect: { id: proposal.id } },
    note: 3,
    feeling: 'NEUTRAL',
  };

  const traitAttributes = traits.reduce((acc, trait) => ({ ...acc, ...TRAITS[trait] }), {});
  const data = { ...defaultAttributes, ...traitAttributes, ...attributes };

  return db.review.create({ data });
};
