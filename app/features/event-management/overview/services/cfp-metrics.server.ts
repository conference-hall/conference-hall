import { db } from 'prisma/db.server.ts';
import { Prisma } from 'prisma/generated/client.ts';
import { EventAuthorization } from '~/shared/user/event-authorization.server.ts';
import { EventFetcher } from '../../services/event-fetcher.server.ts';

type TrackType = { id: string; name: string };

export class CfpMetrics extends EventAuthorization {
  static for(userId: string, team: string, event: string) {
    return new CfpMetrics(userId, team, event);
  }

  async get() {
    await this.checkAuthorizedEvent('canAccessEvent');

    const eventFetcher = EventFetcher.for(this.userId, this.team, this.event);
    const { id, formats, categories } = await eventFetcher.get();

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
    return db.user.count({ where: { eventsSpeaker: { some: { eventId } } } });
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
        to: `../proposals?formats=${item.id}`,
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
        to: `../proposals?categories=${item.id}`,
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
