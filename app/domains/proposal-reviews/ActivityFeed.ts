import { Prisma } from '@prisma/client';

import { db } from '~/libs/db';
import type { ReviewFeeling } from '~/types/proposals.types';

import { UserEvent } from '../organizer-event-settings/UserEvent';

type ReviewFeed = {
  id: string;
  type: 'review';
  timestamp: Date;
  userId: string;
  feeling: ReviewFeeling | null;
  note: number | null;
};

type CommentFeed = { id: string; type: 'comment'; timestamp: Date; userId: string; comment: string };

export type Feed = Awaited<ReturnType<ActivityFeed['activity']>>;

export type FeedItem = Feed[number];

export class ActivityFeed {
  constructor(
    private proposalId: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string, proposalId: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new ActivityFeed(proposalId, userEvent);
  }

  async activity() {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER', 'REVIEWER']);

    let results: Array<ReviewFeed | CommentFeed> = [];

    // Get reviews and comments from proposal
    if (event.displayProposalsReviews) {
      results = await db.$queryRaw<Array<ReviewFeed | CommentFeed>>(
        Prisma.sql`
          (
            SELECT id, 'review' AS type, reviews."updatedAt" AS timestamp, reviews."userId", reviews."feeling", reviews."note", NULL AS comment
            FROM reviews
            WHERE reviews."proposalId" = ${this.proposalId} and reviews."feeling" != 'NO_OPINION'
          )
          UNION ALL
          (
            SELECT id, 'comment' AS type, messages."updatedAt" AS timestamp, messages."userId", NULL, NULL, messages."message" AS comment
            FROM messages
            WHERE messages."proposalId" = ${this.proposalId} AND messages."channel" = 'ORGANIZER'
          )
          ORDER BY timestamp ASC
        `,
      );
    } else {
      results = await db.$queryRaw<Array<ReviewFeed | CommentFeed>>(
        Prisma.sql`
          SELECT id, 'comment' AS type, messages."updatedAt" AS timestamp, messages."userId", NULL, NULL, messages."message" AS comment
          FROM messages
          WHERE messages."proposalId" = ${this.proposalId} AND messages."channel" = 'ORGANIZER'
          ORDER BY timestamp ASC
        `,
      );
    }

    // Get users from feed
    const userIds = [...new Set(results.map((result) => result.userId))];
    const users = await db.user.findMany({ where: { id: { in: userIds } } });

    return results.map((result) => {
      const user = users.find((user) => user.id === result.userId);
      return {
        ...result,
        timestamp: result.timestamp.toUTCString(),
        user: user?.name ?? '?',
        picture: user?.picture ?? null,
      };
    });
  }
}
