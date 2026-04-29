import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import type { EmojiReaction } from '~/shared/types/emojis.types.ts';
import type { ReviewFeeling } from '~/shared/types/proposals.types.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { Prisma } from '../../../../../prisma/generated/client.ts';

type ReviewFeed = {
  id: string;
  type: 'review';
  timestamp: Date;
  userId: string;
  feeling: ReviewFeeling;
  note: number | null;
};

type CommentFeed = {
  id: string;
  type: 'comment';
  timestamp: Date;
  userId: string;
  comment: string;
  reactions: Array<EmojiReaction>;
};

export type Feed = Awaited<ReturnType<ActivityFeed['activity']>>;

export type FeedItem = Feed[number];

export class ActivityFeed {
  constructor(
    private authorizedEvent: AuthorizedEvent,
    private proposalId: string,
  ) {}

  static for(authorizedEvent: AuthorizedEvent, proposalId: string) {
    return new ActivityFeed(authorizedEvent, proposalId);
  }

  async activity() {
    const { event } = this.authorizedEvent;

    let results: Array<ReviewFeed | CommentFeed> = [];

    if (event.displayProposalsReviews) {
      results = await db.$queryRaw<Array<ReviewFeed | CommentFeed>>(
        Prisma.sql`
          (
            SELECT id, 'review' AS type, reviews."updatedAt" AS timestamp, reviews."userId", reviews."feeling", reviews."note", NULL AS comment
            FROM reviews
            WHERE reviews."proposalId" = ${this.proposalId}
          )
          UNION ALL
          (
            SELECT cm.id, 'comment' AS type, cm."createdAt" AS timestamp, cm."senderId" AS "userId", NULL as "feeling", NULL as "note", cm."content" AS comment
            FROM conversation_messages cm
            INNER JOIN conversations c ON c.id = cm."conversationId"
            WHERE c."proposalId" = ${this.proposalId} AND c."type" = 'PROPOSAL_REVIEW_COMMENTS'
          )
          ORDER BY timestamp ASC
        `,
      );
    } else {
      results = await db.$queryRaw<Array<CommentFeed>>(
        Prisma.sql`
          SELECT cm.id, 'comment' AS type, cm."createdAt" AS timestamp, cm."senderId" AS "userId", NULL as "feeling", NULL as "note", cm."content" AS comment
          FROM conversation_messages cm
          INNER JOIN conversations c ON c.id = cm."conversationId"
          WHERE c."proposalId" = ${this.proposalId} AND c."type" = 'PROPOSAL_REVIEW_COMMENTS'
          ORDER BY timestamp ASC
        `,
      );
    }

    // Get users from activities
    const userIds = [...new Set(results.map((result) => result.userId))];
    const users = await db.user.findMany({ where: { id: { in: userIds } } });

    // Get comments reactions
    const commentIds = results.filter((result) => result.type === 'comment').map((result) => result.id);
    const reactions = await ActivityFeed.listReactions(commentIds, this.authorizedEvent.userId);

    return results.map((result) => {
      const user = users.find((user) => user.id === result.userId);

      if (result.type === 'comment') {
        result.reactions = reactions[result.id] || [];
      }

      return {
        ...result,
        timestamp: result.timestamp,
        user: user?.name ?? '?',
        picture: user?.picture ?? null,
      };
    });
  }

  private static async listReactions(messageIds: Array<string>, currentUserId: string) {
    if (messageIds.length === 0) return {};

    const reactions = await db.conversationReaction.findMany({
      where: { messageId: { in: messageIds } },
      include: { reactedBy: true },
    });

    return messageIds.reduce<Record<string, Array<EmojiReaction>>>((byMessage, messageId) => {
      const messageReactions = reactions.filter((reaction) => reaction.messageId === messageId);

      byMessage[messageId] = messageReactions.reduce<Array<EmojiReaction>>((byCode, reaction) => {
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

      return byMessage;
    }, {});
  }
}
