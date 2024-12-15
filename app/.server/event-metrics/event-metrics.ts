import { Prisma } from '@prisma/client';
import { db } from 'prisma/db.server.ts';

import { UserEvent } from '../event-settings/user-event.ts';

type TrackType = { id: string; name: string };

export class EventMetrics {
  constructor(
    private userId: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new EventMetrics(userId, userEvent);
  }

  async globalMetrics() {
    const { id, formats, categories } = await this.userEvent.get();

    const proposalsCount = await this.proposalsCount(id);
    if (proposalsCount === 0) {
      return {
        proposalsCount: 0,
        speakersCount: 0,
        reviewsCount: 0,
        byFormats: formats.length !== 0 ? [] : null,
        byCategories: categories.length !== 0 ? [] : null,
        byDays: [],
      };
    }

    return {
      proposalsCount,
      speakersCount: await this.speakersCount(id),
      reviewsCount: await this.reviewsCount(id),
      byFormats: await this.proposalsByFormats(id, formats),
      byCategories: await this.proposalsByCategories(id, categories),
      byDays: await this.proposalsByDays(id),
    };
  }

  private async proposalsCount(eventId: string) {
    return db.proposal.count({ where: { eventId, isDraft: false } });
  }

  private async reviewsCount(eventId: string) {
    return db.review.count({ where: { proposal: { eventId, isDraft: false }, userId: this.userId } });
  }

  private async speakersCount(eventId: string) {
    return db.user.count({ where: { proposals: { some: { eventId, isDraft: false } } } });
  }

  private async proposalsByFormats(eventId: string, formats: Array<TrackType>) {
    if (formats.length === 0) return null;

    const byFormats = await db.$queryRaw<Array<{ id: string; value: bigint }>>(
      Prisma.sql`
        SELECT _proposals_formats."A" AS id, count(proposals.id) AS value 
        FROM _proposals_formats
        JOIN proposals ON proposals.id = _proposals_formats."B"
        WHERE proposals."isDraft" IS FALSE 
        AND proposals."eventId" = ${eventId}
        GROUP BY _proposals_formats."A"
      `,
    );

    return byFormats.map((item) => {
      const format = formats.find((f) => f.id === item.id);
      return {
        id: item.id,
        name: format?.name || 'unknown',
        value: Number(item.value),
        to: `reviews?formats=${item.id}`,
      };
    });
  }

  private async proposalsByCategories(eventId: string, categories: Array<TrackType>) {
    if (categories.length === 0) return null;

    const byCategories = await db.$queryRaw<Array<{ id: string; value: bigint }>>(
      Prisma.sql`
        SELECT _proposals_categories."A" AS id, count(proposals.id) AS value 
        FROM _proposals_categories
        JOIN proposals ON proposals.id = _proposals_categories."B"
        WHERE proposals."isDraft" IS FALSE 
        AND proposals."eventId" = ${eventId}
        GROUP BY _proposals_categories."A"
      `,
    );

    return byCategories.map((item) => {
      const category = categories.find((f) => f.id === item.id);
      return {
        id: item.id,
        name: category?.name || 'unknown',
        value: Number(item.value),
        to: `reviews?categories=${item.id}`,
      };
    });
  }

  private async proposalsByDays(eventId: string) {
    const proposalsByDays = await db.$queryRaw<Array<{ date: Date; count: bigint; cumulative: bigint }>>(
      Prisma.sql`
        WITH data AS (
          SELECT DATE_TRUNC('day', "createdAt") AS date, count(id) AS count
          FROM proposals
          WHERE "eventId"=${eventId}
          AND "isDraft" IS FALSE
          GROUP BY 1
          ORDER BY 1
        )
        SELECT date, count, SUM(count) OVER (ORDER BY date ASC rows BETWEEN unbounded preceding AND current row) AS cumulative FROM data
      `,
    );

    return proposalsByDays.map((item) => ({
      date: item.date,
      count: Number(item.count),
      cumulative: Number(item.cumulative),
    }));
  }
}
