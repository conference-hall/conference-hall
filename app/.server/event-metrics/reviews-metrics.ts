import { Prisma } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/library';
import { db } from 'prisma/db.server.ts';
import { UserEvent } from '../event-settings/user-event.ts';

type ReviewsMetricsInfo = {
  totalProposals: number;
  totalReviews: number;
  reviewedProposals: number;
  averageNote: Decimal;
  medianNote: number;
  positiveReviews: number;
};

type ProposalReviewCount = {
  proposalId: string;
  reviewCount: number;
};

type ProposalAverageNote = {
  averageNote: Decimal;
  count: number;
};

export class ReviewsMetrics {
  constructor(
    private userId: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new ReviewsMetrics(userId, userEvent);
  }

  async get() {
    const event = await this.userEvent.needsPermission('canAccessEvent');

    const totalProposals = await this.proposalsCount(event.id);
    if (totalProposals === 0) {
      return {
        totalProposals: 0,
        reviewedProposals: 0,
        completionRate: 0,
        distributionBalance: { underReviewed: 0, adequatelyReviewed: 0, wellReviewed: 0 },
        averageNote: 0,
        medianNote: 0,
        positiveReviews: 0,
        noteDistribution: [],
        averageNotesDistribution: [],
      };
    }

    const [overallMetrics, proposalReviewCounts, averageNotesDistribution] = await Promise.all([
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
      medianNote: Number(overallMetrics?.medianNote ?? 0),
      positiveReviews: Number(overallMetrics?.positiveReviews ?? 0),
      distributionBalance: this.calculateDistributionBalance(proposalReviewCounts),
      averageNotesDistribution: averageNotesDistribution.map((item) => ({
        averageNote: item.averageNote.toNumber(),
        count: Number(item.count),
      })),
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
        (
          SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY r.note)
          FROM reviews r
          JOIN proposals p ON r."proposalId" = p.id
          WHERE p."eventId" = ${eventId} AND p."isDraft" = false AND r.note IS NOT NULL
        ) as "medianNote",
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

  private calculateDistributionBalance(proposalReviewCounts: Array<ProposalReviewCount>) {
    const totalProposals = proposalReviewCounts.length;
    if (totalProposals === 0) {
      return { underReviewed: 0, adequatelyReviewed: 0, wellReviewed: 0 };
    }

    let underReviewed = 0;
    let adequatelyReviewed = 0;
    let wellReviewed = 0;

    for (const proposal of proposalReviewCounts) {
      const count = Number(proposal.reviewCount);
      if (count < 2) {
        underReviewed++;
      } else if (count >= 2 && count <= 4) {
        adequatelyReviewed++;
      } else {
        wellReviewed++;
      }
    }

    return {
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
