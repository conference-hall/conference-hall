import { db } from 'prisma/db.server.ts';
import type { EmojiReaction } from '~/shared/types/emojis.types.ts';
import { UserEventAuthorization } from '~/shared/user/user-event-authorization.server.ts';
import type { CommentReactionData, CommentSaveData } from './comments.schema.server.ts';

// todo(conversation): delete Channel attribute from comments table
export class Comments extends UserEventAuthorization {
  private proposalId: string;

  constructor(userId: string, team: string, event: string, proposalId: string) {
    super(userId, team, event);
    this.proposalId = proposalId;
  }

  static for(userId: string, team: string, event: string, proposalId: string) {
    return new Comments(userId, team, event, proposalId);
  }

  async save(comment: CommentSaveData) {
    await this.needsPermission('canAccessEvent');

    if (comment.id) {
      await db.comment.update({
        data: { comment: comment.message },
        where: { id: comment.id, userId: this.userId, proposalId: this.proposalId },
      });
    } else {
      await db.comment.create({
        data: { userId: this.userId, proposalId: this.proposalId, comment: comment.message, channel: 'ORGANIZER' },
      });
    }
  }

  async remove(id: string) {
    await this.needsPermission('canAccessEvent');

    await db.comment.deleteMany({ where: { id, userId: this.userId, proposalId: this.proposalId } });
  }

  async reactToComment({ id, code }: CommentReactionData) {
    await this.needsPermission('canAccessEvent');

    const existingReaction = await db.commentReaction.findUnique({
      where: { userId_commentId_code: { userId: this.userId, commentId: id, code } },
    });

    // delete
    if (existingReaction) {
      return db.commentReaction.delete({
        where: { userId_commentId_code: { userId: this.userId, commentId: id, code } },
      });
    }

    // create
    return db.commentReaction.create({ data: { userId: this.userId, commentId: id, code } });
  }

  static async listReactions(commentIds: Array<string>, currentUserId: string) {
    if (commentIds.length === 0) return {};

    const reactions = await db.commentReaction.findMany({
      where: { commentId: { in: commentIds } },
      include: { reactedBy: true },
    });

    // todo(conversation): resuse algo with conversations
    return commentIds.reduce<Record<string, Array<EmojiReaction>>>((byComments, commentId) => {
      const commentReactions = reactions.filter((reaction) => reaction.commentId === commentId);

      byComments[commentId] = commentReactions.reduce<Array<EmojiReaction>>((byCode, reaction) => {
        const reacted = reaction.userId === currentUserId;
        const reactedBy = reacted ? 'You' : reaction.reactedBy.name; // todo(conversation): not translated "You" cause issue with optimistic rendetring

        const existing = byCode.find((r) => r.code === reaction.code);
        if (!existing) {
          byCode.push({ code: reaction.code, reacted, reactedBy: [reactedBy] });
        } else {
          existing.reacted = existing.reacted || reacted;
          existing.reactedBy.push(reactedBy);
        }
        return byCode;
      }, []);

      return byComments;
    }, {});
  }
}
