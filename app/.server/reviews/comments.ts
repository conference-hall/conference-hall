import { db } from 'prisma/db.server.ts';

import type { EmojiReaction } from '~/routes/__components/emojis/emojis.ts';
import { UserEvent } from '../event-settings/user-event.ts';
import type { CommentReactionData } from './proposal-review.types.ts';

export class Comments {
  constructor(
    private userId: string,
    private proposalId: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string, proposalId: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new Comments(userId, proposalId, userEvent);
  }

  async add(comment: string) {
    await this.userEvent.needsPermission('canAccessEvent');

    await db.comment.create({
      data: { userId: this.userId, proposalId: this.proposalId, comment, channel: 'ORGANIZER' },
    });
  }

  async remove(commentId: string) {
    await this.userEvent.needsPermission('canAccessEvent');

    await db.comment.deleteMany({ where: { id: commentId, userId: this.userId, proposalId: this.proposalId } });
  }

  // TODO: Add tests
  async reactToComment({ commentId, code }: CommentReactionData) {
    await this.userEvent.needsPermission('canAccessEvent');

    const existingReaction = await db.commentReaction.findUnique({
      where: { userId_commentId_code: { userId: this.userEvent.userId, commentId, code } },
    });

    // delete
    if (existingReaction) {
      return db.commentReaction.delete({
        where: { userId_commentId_code: { userId: this.userEvent.userId, commentId, code } },
      });
    }

    // create
    return db.commentReaction.create({ data: { userId: this.userEvent.userId, commentId, code } });
  }

  // TODO: Add tests
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
        const reactedBy = reacted ? 'You' : reaction.reactedBy.name;

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
