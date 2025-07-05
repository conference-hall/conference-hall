import type { Event, Team, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { ReviewsMetrics } from './reviews-metrics.ts';

describe('ReviewsMetrics', () => {
  let owner: User;
  let member: User;
  let reviewer1: User;
  let reviewer2: User;
  let team: Team;
  let event: Event;
  let otherEvent: Event;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['peter-parker'] });
    reviewer1 = await userFactory();
    reviewer2 = await userFactory();
    team = await teamFactory({ owners: [owner] });
    event = await eventFactory({ team });
    otherEvent = await eventFactory({ team });
  });

  describe('#get', () => {
    it('returns metrics for event with reviews', async () => {
      // Create talks and proposals with different review counts
      const talk1 = await talkFactory({ speakers: [member] });
      const talk2 = await talkFactory({ speakers: [owner] });
      const talk3 = await talkFactory({ speakers: [member] });
      const talk4 = await talkFactory({ speakers: [owner] });

      const proposal1 = await proposalFactory({ event, talk: talk1 });
      const proposal2 = await proposalFactory({ event, talk: talk2 });
      const proposal3 = await proposalFactory({ event, talk: talk3 });
      const _proposal4 = await proposalFactory({ event, talk: talk4 });

      // Create reviews with different notes and feelings
      await reviewFactory({ user: member, proposal: proposal1, attributes: { note: 5, feeling: 'POSITIVE' } });
      await reviewFactory({ user: owner, proposal: proposal1, attributes: { note: 4, feeling: 'POSITIVE' } });
      await reviewFactory({ user: reviewer1, proposal: proposal1, attributes: { note: 3, feeling: 'NEGATIVE' } });

      await reviewFactory({ user: member, proposal: proposal2, attributes: { note: 2, feeling: 'NEGATIVE' } });
      await reviewFactory({ user: owner, proposal: proposal2, attributes: { note: 1, feeling: 'NEGATIVE' } });

      await reviewFactory({ user: member, proposal: proposal3, attributes: { note: 5, feeling: 'POSITIVE' } });

      const metrics = await ReviewsMetrics.for(owner.id, team.slug, event.slug).get();

      expect(metrics).toEqual({
        totalProposals: 4,
        reviewedProposals: 3,
        completionRate: 75,
        averageNote: 3.3333333333333335,
        positiveReviews: 3,
        proposalNotesDistribution: [
          { averageNote: 1.5, count: 1 },
          { averageNote: 4, count: 1 },
          { averageNote: 5, count: 1 },
        ],
        reviewCountDistribution: {
          missingReviews: 25,
          underReviewed: 50,
          adequatelyReviewed: 25,
          wellReviewed: 0,
        },
      });
    });

    it('returns empty metrics for event with no proposals', async () => {
      const metrics = await ReviewsMetrics.for(owner.id, team.slug, event.slug).get();

      expect(metrics).toEqual({
        totalProposals: 0,
        reviewedProposals: 0,
        completionRate: 0,
        averageNote: 0,
        positiveReviews: 0,
        proposalNotesDistribution: [],
        reviewCountDistribution: {
          missingReviews: 0,
          underReviewed: 0,
          adequatelyReviewed: 0,
          wellReviewed: 0,
        },
      });
    });

    it('returns metrics for event with proposals but no reviews', async () => {
      const talk1 = await talkFactory({ speakers: [member] });
      const talk2 = await talkFactory({ speakers: [owner] });

      await proposalFactory({ event, talk: talk1 });
      await proposalFactory({ event, talk: talk2 });

      const metrics = await ReviewsMetrics.for(owner.id, team.slug, event.slug).get();

      expect(metrics).toEqual({
        totalProposals: 2,
        reviewedProposals: 0,
        completionRate: 0,
        averageNote: 0,
        positiveReviews: 0,
        proposalNotesDistribution: [],
        reviewCountDistribution: {
          missingReviews: 100,
          underReviewed: 0,
          adequatelyReviewed: 0,
          wellReviewed: 0,
        },
      });
    });

    it('calculates review count distribution correctly', async () => {
      // Create talks and proposals with specific review counts to test thresholds
      const talks = await Promise.all([
        talkFactory({ speakers: [member] }),
        talkFactory({ speakers: [owner] }),
        talkFactory({ speakers: [member] }),
        talkFactory({ speakers: [owner] }),
        talkFactory({ speakers: [member] }),
      ]);

      const _missingReviewsProposal = await proposalFactory({ event, talk: talks[0] });
      const underReviewedProposal1 = await proposalFactory({ event, talk: talks[1] });
      const underReviewedProposal2 = await proposalFactory({ event, talk: talks[2] });
      const adequateProposal = await proposalFactory({ event, talk: talks[3] });
      const wellReviewedProposal = await proposalFactory({ event, talk: talks[4] });

      // 0 reviews (missing)
      // _missingReviewsProposal - no reviews

      // 1 review (under-reviewed)
      await reviewFactory({ user: member, proposal: underReviewedProposal1, attributes: { note: 3 } });

      // 2 reviews (under-reviewed)
      await reviewFactory({ user: member, proposal: underReviewedProposal2, attributes: { note: 3 } });
      await reviewFactory({ user: owner, proposal: underReviewedProposal2, attributes: { note: 4 } });

      // 3 reviews (adequate)
      await reviewFactory({ user: member, proposal: adequateProposal, attributes: { note: 3 } });
      await reviewFactory({ user: owner, proposal: adequateProposal, attributes: { note: 4 } });
      await reviewFactory({ user: reviewer1, proposal: adequateProposal, attributes: { note: 5 } });

      // 6 reviews (well-reviewed) - need different users for each review
      const additionalReviewers = await Promise.all([userFactory(), userFactory(), userFactory(), userFactory()]);
      await reviewFactory({ user: member, proposal: wellReviewedProposal, attributes: { note: 4 } });
      await reviewFactory({ user: owner, proposal: wellReviewedProposal, attributes: { note: 4 } });
      await reviewFactory({ user: reviewer1, proposal: wellReviewedProposal, attributes: { note: 4 } });
      await reviewFactory({ user: reviewer2, proposal: wellReviewedProposal, attributes: { note: 4 } });
      await reviewFactory({ user: additionalReviewers[0], proposal: wellReviewedProposal, attributes: { note: 4 } });
      await reviewFactory({ user: additionalReviewers[1], proposal: wellReviewedProposal, attributes: { note: 4 } });

      const metrics = await ReviewsMetrics.for(owner.id, team.slug, event.slug).get();

      expect(metrics.reviewCountDistribution).toEqual({
        missingReviews: 20, // 1/5 = 20%
        underReviewed: 40, // 2/5 = 40%
        adequatelyReviewed: 20, // 1/5 = 20%
        wellReviewed: 20, // 1/5 = 20%
      });
    });

    it('excludes draft proposals from metrics', async () => {
      const talk1 = await talkFactory({ speakers: [member] });
      const talk2 = await talkFactory({ speakers: [owner] });

      await proposalFactory({ event, talk: talk1, traits: ['draft'] });
      await proposalFactory({ event, talk: talk2 });

      const metrics = await ReviewsMetrics.for(owner.id, team.slug, event.slug).get();

      expect(metrics.totalProposals).toBe(1);
    });

    it('throws an error if the user does not have permission to access the event', async () => {
      await expect(ReviewsMetrics.for(member.id, team.slug, otherEvent.slug).get()).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });
});
