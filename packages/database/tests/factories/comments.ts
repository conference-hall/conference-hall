import type { Prisma, Proposal, User } from '../../index.ts';
import { CommentChannel, db } from '../../index.ts';

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
