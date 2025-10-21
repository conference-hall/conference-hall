import { db } from 'prisma/db.server.ts';
import { Prisma } from 'prisma/generated/client.ts';
import type { EmojiReaction } from '~/shared/types/emojis.types.ts';
import type { ReviewFeeling } from '~/shared/types/proposals.types.ts';
import { EventAuthorization } from '~/shared/user/event-authorization.server.ts';
import { Comments } from './comments.server.ts';

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

export class ActivityFeed extends EventAuthorization {
  private proposalId: string;

  constructor(userId: string, team: string, event: string, proposalId: string) {
    super(userId, team, event);
    this.proposalId = proposalId;
  }

  static for(userId: string, team: string, event: string, proposalId: string) {
    return new ActivityFeed(userId, team, event, proposalId);
  }

  async activity() {
    const { event } = await this.checkAuthorizedEvent('canAccessEvent');

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
            SELECT id, 'comment' AS type, comments."createdAt" AS timestamp, comments."userId", NULL as "feeling", NULL as "note", comments."comment" AS comment
            FROM comments
            WHERE comments."proposalId" = ${this.proposalId} AND comments."channel" = 'ORGANIZER'
          )
          ORDER BY timestamp ASC
        `,
      );
    } else {
      results = await db.$queryRaw<Array<CommentFeed>>(
        Prisma.sql`
          SELECT id, 'comment' AS type, comments."createdAt" AS timestamp, comments."userId", NULL as "feeling", NULL as "note", comments."comment" AS comment
          FROM comments
          WHERE comments."proposalId" = ${this.proposalId} AND comments."channel" = 'ORGANIZER'
          ORDER BY timestamp ASC
        `,
      );
    }

    // Get users from activities
    const userIds = [...new Set(results.map((result) => result.userId))];
    const users = await db.user.findMany({ where: { id: { in: userIds } } });

    // Get comments reactions
    const commentIds = results.filter((result) => result.type === 'comment').map((result) => result.id);
    const reactions = await Comments.listReactions(commentIds, this.userId);

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
}
