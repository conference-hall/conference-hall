import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import type { Event, Team, User } from '../../../../../prisma/generated/client.ts';
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
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const metrics = await ReviewersMetrics.for(authorizedEvent).get();

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
            dismissedCount: 0,
          },
          {
            id: speaker.id,
            name: speaker.name,
            picture: speaker.picture,
            reviewsCount: 1,
            averageNote: 5,
            positiveCount: 1,
            negativeCount: 0,
            dismissedCount: 0,
          },
        ],
      });
    });

    it('returns dismissed reviews in reviewer stats', async () => {
      const dismissedTeam = await teamFactory({ owners: [owner] });
      const dismissedEvent = await eventFactory({ team: dismissedTeam });

      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event: dismissedEvent, talk });
      await reviewFactory({ user: owner, proposal, attributes: { feeling: 'NEUTRAL', note: 3 } });
      await reviewFactory({
        user: speaker,
        proposal,
        attributes: { feeling: 'POSITIVE', note: 5 },
        traits: ['dismissed'],
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, dismissedTeam.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, dismissedEvent.slug);

      const metrics = await ReviewersMetrics.for(authorizedEvent).get();

      expect(metrics.reviewersMetrics).toHaveLength(2);
      const ownerMetrics = metrics.reviewersMetrics.find((r) => r.id === owner.id);
      const speakerMetrics = metrics.reviewersMetrics.find((r) => r.id === speaker.id);

      expect(ownerMetrics).toEqual(expect.objectContaining({ reviewsCount: 1, dismissedCount: 0 }));
      expect(speakerMetrics).toEqual(expect.objectContaining({ reviewsCount: 1, dismissedCount: 1 }));
    });

    it('returns reviewers metrics for an event without reviews', async () => {
      const team = await teamFactory({ owners: [owner] });
      const event = await eventFactory({ team });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const metrics = await ReviewersMetrics.for(authorizedEvent).get();

      expect(metrics).toEqual({ proposalsCount: 0, reviewersMetrics: [] });
    });
  });
});
