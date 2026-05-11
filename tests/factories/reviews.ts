import { db } from '../../prisma/db.server.ts';
import type { Proposal, User } from '../../prisma/generated/client.ts';
import type { ReviewCreateInput } from '../../prisma/generated/models.ts';
import { applyTraits } from './helpers/traits.ts';

type Trait = keyof typeof TRAITS;

const TRAITS = {
  'self-dismissed': { dismissedAt: new Date() },
};

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

  const traitAttributes = applyTraits(TRAITS, traits);
  const isSelfDismissed = traits.includes('self-dismissed');

  const data = {
    ...defaultAttributes,
    ...traitAttributes,
    ...(isSelfDismissed ? { dismissedUser: { connect: { id: user.id } } } : {}),
    ...attributes,
  };

  return db.review.create({ data });
};
