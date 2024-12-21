import { CommentChannel, type Prisma, type Proposal, type User } from '@prisma/client/app/index.js';

import { db } from '../../prisma/db.server.ts';

type FactoryOptions = {
  user: User;
  proposal: Proposal;
  attributes?: Partial<Prisma.CommentCreateInput>;
  traits?: Array<Trait>;
};

type Trait = 'withReaction';

export const commentFactory = async (options: FactoryOptions) => {
  const { attributes = {}, traits = [], user, proposal } = options;

  const defaultAttributes: Prisma.CommentCreateInput = {
    user: { connect: { id: user.id } },
    proposal: { connect: { id: proposal.id } },
    comment: 'My comment',
    channel: CommentChannel.ORGANIZER,
  };

  const data = { ...defaultAttributes, ...attributes };
  const comment = await db.comment.create({ data });

  if (traits.includes('withReaction')) {
    await db.commentReaction.create({
      data: {
        code: 'tada',
        commentId: comment.id,
        userId: user.id,
      },
    });
  }

  return comment;
};
