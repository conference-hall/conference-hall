import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import type { EmojiReaction } from '~/shared/types/emojis.types.ts';
import { db } from '../../../../../prisma/db.server.ts';
import type { CommentReactionData, CommentSaveData } from './comments.schema.server.ts';

export class Comments {
  constructor(
    private authorizedEvent: AuthorizedEvent,
    private proposalId: string,
  ) {}

  static for(authorizedEvent: AuthorizedEvent, proposalId: string) {
    return new Comments(authorizedEvent, proposalId);
  }

  async save(comment: CommentSaveData) {
    const { permissions } = this.authorizedEvent;

    if (comment.id) {
      await db.comment.updateMany({
        data: { comment: comment.message },
        where: { id: comment.id, userId: permissions.canManageConversations ? undefined : this.authorizedEvent.userId },
      });
    } else {
      await db.comment.create({
        data: {
          userId: this.authorizedEvent.userId,
          proposalId: this.proposalId,
          comment: comment.message,
          channel: 'ORGANIZER',
        },
      });
    }
  }

  async remove(id: string) {
    const { permissions } = this.authorizedEvent;

    await db.comment.deleteMany({
      where: {
        id,
        userId: permissions.canManageConversations ? undefined : this.authorizedEvent.userId,
        proposalId: this.proposalId,
      },
    });
  }

  async reactToComment({ id, code }: CommentReactionData) {
    const existingReaction = await db.commentReaction.findUnique({
      where: { userId_commentId_code: { userId: this.authorizedEvent.userId, commentId: id, code } },
    });

    // delete
    if (existingReaction) {
      return db.commentReaction.delete({
        where: { userId_commentId_code: { userId: this.authorizedEvent.userId, commentId: id, code } },
      });
    }

    // create
    return db.commentReaction.create({ data: { userId: this.authorizedEvent.userId, commentId: id, code } });
  }

  static async listReactions(commentIds: Array<string>, currentUserId: string) {
    if (commentIds.length === 0) return {};

    const reactions = await db.commentReaction.findMany({
      where: { commentId: { in: commentIds } },
      include: { reactedBy: true },
    });

    return commentIds.reduce<Record<string, Array<EmojiReaction>>>((byComments, commentId) => {
      const commentReactions = reactions.filter((reaction) => reaction.commentId === commentId);

      byComments[commentId] = commentReactions.reduce<Array<EmojiReaction>>((byCode, reaction) => {
        const reacted = reaction.userId === currentUserId;
        const reactedByName = reaction.reactedBy.name;

        const existing = byCode.find((r) => r.code === reaction.code);
        if (!existing) {
          byCode.push({
            code: reaction.code,
            reacted,
            reactedBy: [{ userId: reaction.userId, name: reactedByName }],
          });
        } else {
          existing.reacted = existing.reacted || reacted;
          existing.reactedBy.push({ userId: reaction.userId, name: reactedByName });
        }
        return byCode;
      }, []);

      return byComments;
    }, {});
  }
}
