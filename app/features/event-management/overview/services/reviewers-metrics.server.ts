import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { Prisma } from '../../../../../prisma/generated/client.ts';

type ReviewerMetricsInfo = {
  id: string;
  name: string;
  picture: string;
  reviewsCount: number;
  averageNote: Prisma.Decimal;
  positiveCount: number;
  negativeCount: number;
};

export class ReviewersMetrics {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new ReviewersMetrics(authorizedEvent);
  }

  async get() {
    const { event } = this.authorizedEvent;

    const proposalsCount = await this.proposalsCount(event.id);
    if (proposalsCount === 0) {
      return { proposalsCount: 0, reviewersMetrics: [] };
    }

    const reviewersMetrics = await db.$queryRaw<Array<ReviewerMetricsInfo>>(Prisma.sql`
      SELECT
        users."id",
        users."name",
        users."picture",
        COUNT(reviews."id") as "reviewsCount",
        AVG(reviews."note") as "averageNote",
        COUNT(reviews."feeling") FILTER (WHERE reviews."feeling" = 'POSITIVE') as "positiveCount",
        COUNT(reviews."feeling") FILTER (WHERE reviews."feeling" = 'NEGATIVE') as "negativeCount"
      FROM reviews
      JOIN users ON reviews."userId" = users.id
      JOIN proposals ON reviews."proposalId" = proposals.id
      WHERE proposals."eventId" = ${event.id}
      GROUP BY 1, 2, 3
      ORDER BY "reviewsCount" DESC
    `);

    return {
      proposalsCount,
      reviewersMetrics: reviewersMetrics.map((reviewer) => ({
        id: reviewer.id,
        name: reviewer.name,
        picture: reviewer.picture,
        reviewsCount: Number(reviewer.reviewsCount ?? 0),
        averageNote: reviewer.averageNote?.toNumber() ?? 0,
        positiveCount: Number(reviewer.positiveCount ?? 0),
        negativeCount: Number(reviewer.negativeCount ?? 0),
      })),
    };
  }

  private async proposalsCount(eventId: string) {
    return db.proposal.count({ where: { eventId, isDraft: false } });
  }
}
