import type { Event, Team, User } from '@conference-hall/database';
import { eventFactory } from '@conference-hall/database/tests/factories/events.ts';
import { proposalFactory } from '@conference-hall/database/tests/factories/proposals.ts';
import { reviewFactory } from '@conference-hall/database/tests/factories/reviews.ts';
import { talkFactory } from '@conference-hall/database/tests/factories/talks.ts';
import { teamFactory } from '@conference-hall/database/tests/factories/team.ts';
import { userFactory } from '@conference-hall/database/tests/factories/users.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { ReviewersMetrics } from './reviewers-metrics.server.ts';

describe('ReviewersMetrics', () => {
  let owner: User;
  let speaker: User;
  let team: Team;
  let event: Event;
  let event2: Event;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner] });
    event = await eventFactory({ team });
    event2 = await eventFactory();

    const talk1 = await talkFactory({ speakers: [speaker] });
    const talk2 = await talkFactory({ speakers: [owner] });

    const proposal1 = await proposalFactory({ event, talk: talk1 });
    await reviewFactory({ user: speaker, proposal: proposal1, attributes: { feeling: 'POSITIVE', note: 5 } });
    await reviewFactory({ user: owner, proposal: proposal1, attributes: { feeling: 'NEUTRAL', note: 1 } });

    const proposal2 = await proposalFactory({ event, talk: talk2 });
    await reviewFactory({ user: owner, proposal: proposal2, attributes: { feeling: 'NEGATIVE', note: 0 } });

    const otherEventProposal = await proposalFactory({ event: event2, talk: talk2 });
    await reviewFactory({ user: owner, proposal: otherEventProposal, attributes: { feeling: 'NEGATIVE', note: 0 } });
  });

  describe('#get', () => {
    it('returns reviewers metrics for an event', async () => {
      const metrics = await ReviewersMetrics.for(owner.id, team.slug, event.slug).get();

      expect(metrics).toEqual({
        proposalsCount: 2,
        reviewersMetrics: [
          {
            id: owner.id,
            name: owner.name,
            picture: owner.picture,
            reviewsCount: 2,
            averageNote: 0.5,
            positiveCount: 0,
            negativeCount: 1,
          },
          {
            id: speaker.id,
            name: speaker.name,
            picture: speaker.picture,
            reviewsCount: 1,
            averageNote: 5,
            positiveCount: 1,
            negativeCount: 0,
          },
        ],
      });
    });

    it('returns reviewers metrics for an event without reviews', async () => {
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });

      const metrics = await ReviewersMetrics.for(owner.id, team.slug, event.slug).get();

      expect(metrics).toEqual({ proposalsCount: 0, reviewersMetrics: [] });
    });

    it('throws an error if the user does not have permission to access the event', async () => {
      await expect(ReviewersMetrics.for(owner.id, team.slug, event2.slug).get()).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });
});
