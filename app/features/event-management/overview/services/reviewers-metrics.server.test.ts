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

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const metrics = await ReviewersMetrics.for(authorizedEvent).get();

      expect(metrics).toEqual({ proposalsCount: 0, reviewersMetrics: [] });
    });
  });
});
