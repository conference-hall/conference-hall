import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { Prisma } from '../../../../../prisma/generated/client.ts';

export class CfpMetrics {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new CfpMetrics(authorizedEvent);
  }

  async get() {
    const { userId } = this.authorizedEvent;
    const eventId = this.authorizedEvent.event.id;

    const proposalsCount = await this.proposalsCount(eventId);
    if (proposalsCount === 0) {
      return {
        proposalsCount: 0,
        speakersCount: 0,
        reviewsCount: 0,
        byFormats: null,
        byCategories: null,
        byDays: [],
      };
    }

    return {
      proposalsCount,
      speakersCount: await this.speakersCount(eventId),
      reviewsCount: await this.reviewsCount(eventId, userId),
      byFormats: await this.proposalsByFormats(eventId),
      byCategories: await this.proposalsByCategories(eventId),
      byDays: await this.proposalsByDays(eventId),
    };
  }

  private async proposalsCount(eventId: string) {
    return db.proposal.count({ where: { eventId, isDraft: false } });
  }

  private async reviewsCount(eventId: string, userId: string) {
    return db.review.count({ where: { proposal: { eventId, isDraft: false }, userId } });
  }

  private async speakersCount(eventId: string) {
    return db.user.count({ where: { eventsSpeaker: { some: { eventId } } } });
  }

  private async proposalsByFormats(eventId: string) {
    const byFormats = await db.$queryRaw<Array<{ id: string; name: string; value: bigint }>>(
      Prisma.sql`
        SELECT ef.id, ef.name, count(pf."B") AS value
        FROM event_formats ef
        LEFT JOIN _proposals_formats pf ON pf."A" = ef.id
        LEFT JOIN proposals p ON p.id = pf."B" AND p."isDraft" IS FALSE AND p."eventId" = ${eventId}
        WHERE ef."eventId" = ${eventId}
        GROUP BY ef.id, ef.name
        ORDER BY ef."order" ASC
      `,
    );

    if (byFormats.length === 0) return null;

    return byFormats.map((item) => ({
      id: item.id,
      name: item.name,
      value: Number(item.value),
    }));
  }

  private async proposalsByCategories(eventId: string) {
    const byCategories = await db.$queryRaw<Array<{ id: string; name: string; value: bigint }>>(
      Prisma.sql`
        SELECT ec.id, ec.name, count(pc."B") AS value
        FROM event_categories ec
        LEFT JOIN _proposals_categories pc ON pc."A" = ec.id
        LEFT JOIN proposals p ON p.id = pc."B" AND p."isDraft" IS FALSE AND p."eventId" = ${eventId}
        WHERE ec."eventId" = ${eventId}
        GROUP BY ec.id, ec.name
        ORDER BY ec."order" ASC
      `,
    );

    if (byCategories.length === 0) return null;

    return byCategories.map((item) => ({
      id: item.id,
      name: item.name,
      value: Number(item.value),
    }));
  }

  private async proposalsByDays(eventId: string) {
    const proposalsByDays = await db.$queryRaw<Array<{ date: Date; count: bigint; cumulative: bigint }>>(
      Prisma.sql`
        WITH data AS (
          SELECT DATE_TRUNC('day', "submittedAt") AS date, count(id) AS count
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
