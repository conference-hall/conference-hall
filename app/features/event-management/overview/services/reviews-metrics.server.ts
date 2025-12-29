import { db } from 'prisma/db.server.ts';
import { Prisma } from 'prisma/generated/client.ts';
import type { AuthorizedEvent } from '~/shared/authorization/types.ts';

type ReviewsMetricsInfo = {
  totalProposals: number;
  totalReviews: number;
  reviewedProposals: number;
  averageNote: Prisma.Decimal;
  positiveReviews: number;
};

type ProposalReviewCount = {
  proposalId: string;
  reviewCount: number;
};

type ProposalAverageNote = {
  averageNote: Prisma.Decimal;
  count: number;
};

export class ReviewsMetrics {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new ReviewsMetrics(authorizedEvent);
  }

  async get() {
    const { event } = this.authorizedEvent;

    const totalProposals = await this.proposalsCount(event.id);
    if (totalProposals === 0) {
      return {
        totalProposals: 0,
        reviewedProposals: 0,
        completionRate: 0,
        averageNote: 0,
        positiveReviews: 0,
        proposalNotesDistribution: [],
        reviewCountDistribution: { missingReviews: 0, underReviewed: 0, adequatelyReviewed: 0, wellReviewed: 0 },
      };
    }

    const [overallMetrics, proposalReviewCounts, proposalNotesDistribution] = await Promise.all([
      this.getOverallMetrics(event.id),
      this.getProposalReviewCounts(event.id),
      this.getProposalAverageNotes(event.id),
    ]);

    const reviewedProposals = Number(overallMetrics?.reviewedProposals ?? 0);
    const completionRate = totalProposals > 0 ? (reviewedProposals / totalProposals) * 100 : 0;

    return {
      totalProposals,
      reviewedProposals,
      completionRate: Math.round(completionRate * 100) / 100,
      averageNote: overallMetrics?.averageNote?.toNumber() ?? 0,
      positiveReviews: Number(overallMetrics?.positiveReviews ?? 0),
      proposalNotesDistribution: proposalNotesDistribution.map((item) => ({
        averageNote: item.averageNote.toNumber(),
        count: Number(item.count),
      })),
      reviewCountDistribution: this.calculateReviewCountDistribution(proposalReviewCounts),
    };
  }

  private async proposalsCount(eventId: string) {
    return db.proposal.count({ where: { eventId, isDraft: false } });
  }

  private async getOverallMetrics(eventId: string): Promise<ReviewsMetricsInfo | null> {
    const result = await db.$queryRaw<Array<ReviewsMetricsInfo>>(Prisma.sql`
      SELECT
        COUNT(DISTINCT proposals.id) as "totalProposals",
        COUNT(reviews.id) as "totalReviews",
        COUNT(DISTINCT CASE WHEN reviews.id IS NOT NULL THEN proposals.id END) as "reviewedProposals",
        AVG(reviews.note) as "averageNote",
        COUNT(reviews.feeling) FILTER (WHERE reviews.feeling = 'POSITIVE') as "positiveReviews"
      FROM proposals
      LEFT JOIN reviews ON reviews."proposalId" = proposals.id
      WHERE proposals."eventId" = ${eventId} AND proposals."isDraft" = false
    `);

    return result[0] || null;
  }

  private async getProposalReviewCounts(eventId: string): Promise<Array<ProposalReviewCount>> {
    return db.$queryRaw<Array<ProposalReviewCount>>(Prisma.sql`
      SELECT
        proposals.id as "proposalId",
        COUNT(reviews.id) as "reviewCount"
      FROM proposals
      LEFT JOIN reviews ON reviews."proposalId" = proposals.id
      WHERE proposals."eventId" = ${eventId} AND proposals."isDraft" = false
      GROUP BY proposals.id
      ORDER BY "reviewCount" DESC
    `);
  }

  private calculateReviewCountDistribution(proposalReviewCounts: Array<ProposalReviewCount>) {
    const totalProposals = proposalReviewCounts.length;
    if (totalProposals === 0) {
      return { missingReviews: 0, underReviewed: 0, adequatelyReviewed: 0, wellReviewed: 0 };
    }

    let missingReviews = 0;
    let underReviewed = 0;
    let adequatelyReviewed = 0;
    let wellReviewed = 0;

    for (const proposal of proposalReviewCounts) {
      const count = Number(proposal.reviewCount);
      if (count === 0) {
        missingReviews++;
      } else if (count >= 1 && count <= 2) {
        underReviewed++;
      } else if (count >= 3 && count <= 5) {
        adequatelyReviewed++;
      } else {
        wellReviewed++;
      }
    }

    return {
      missingReviews: Math.round((missingReviews / totalProposals) * 100 * 100) / 100,
      underReviewed: Math.round((underReviewed / totalProposals) * 100 * 100) / 100,
      adequatelyReviewed: Math.round((adequatelyReviewed / totalProposals) * 100 * 100) / 100,
      wellReviewed: Math.round((wellReviewed / totalProposals) * 100 * 100) / 100,
    };
  }

  private async getProposalAverageNotes(eventId: string): Promise<Array<ProposalAverageNote>> {
    return db.$queryRaw<Array<ProposalAverageNote>>(Prisma.sql`
      SELECT
        ROUND(proposal_avg, 1) as "averageNote",
        COUNT(*) as count
      FROM (
        SELECT
          proposals.id,
          AVG(reviews.note) as proposal_avg
        FROM proposals
        INNER JOIN reviews ON reviews."proposalId" = proposals.id AND reviews.note IS NOT NULL
        WHERE proposals."eventId" = ${eventId} AND proposals."isDraft" = false
        GROUP BY proposals.id
        HAVING COUNT(reviews.id) > 0
      ) proposal_averages
      GROUP BY ROUND(proposal_avg, 1)
      ORDER BY "averageNote" ASC
    `);
  }
}
