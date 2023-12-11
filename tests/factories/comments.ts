import { CommentChannel, type Prisma, type Proposal, type User } from '@prisma/client';

import { db } from '../../app/libs/db.ts';

type FactoryOptions = {
  user: User;
  proposal: Proposal;
  attributes?: Partial<Prisma.CommentCreateInput>;
};

export const commentFactory = (options: FactoryOptions) => {
  const { attributes = {}, user, proposal } = options;

  const defaultAttributes: Prisma.CommentCreateInput = {
    user: { connect: { id: user.id } },
    proposal: { connect: { id: proposal.id } },
    comment: 'My comment',
    channel: CommentChannel.ORGANIZER,
  };

  const data = { ...defaultAttributes, ...attributes };
  return db.comment.create({ data });
};
