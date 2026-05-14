import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';
import type { Event, Team, User } from '../../../../../prisma/generated/client.ts';
import { ReviewerActions } from './reviewer-actions.server.ts';

describe('ReviewerActions', () => {
  let owner: User;
  let member: User;
  let speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner], members: [member], reviewers: [speaker] });
    event = await eventFactory({ team });
  });

  describe('#dismissReviewsByUser', () => {
    it('dismisses all reviews by a user for the event', async () => {
      const proposal1 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposal2 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      await reviewFactory({ proposal: proposal1, user: member, attributes: { feeling: 'NEUTRAL', note: 3 } });
      await reviewFactory({ proposal: proposal2, user: member, attributes: { feeling: 'POSITIVE', note: 5 } });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      await ReviewerActions.for(authorizedEvent).dismissReviewsByUser(member.id);

      const reviews = await db.review.findMany({ where: { userId: member.id, proposal: { eventId: event.id } } });
      expect(reviews.every((r) => r.dismissedAt !== null)).toBe(true);
    });

    it('throws if user lacks canDismissReviews', async () => {
      const authorizedTeam = await getAuthorizedTeam(member.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      await expect(ReviewerActions.for(authorizedEvent).dismissReviewsByUser(owner.id)).rejects.toThrow(
        ForbiddenOperationError,
      );
    });
  });

  describe('#restoreReviewsByUser', () => {
    it('restores all dismissed reviews by a user for the event', async () => {
      const proposal1 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      const proposal2 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
      await reviewFactory({
        proposal: proposal1,
        user: member,
        attributes: { feeling: 'NEUTRAL', note: 3 },
        traits: ['dismissed'],
      });
      await reviewFactory({
        proposal: proposal2,
        user: member,
        attributes: { feeling: 'POSITIVE', note: 5 },
        traits: ['dismissed'],
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      await ReviewerActions.for(authorizedEvent).restoreReviewsByUser(member.id);

      const reviews = await db.review.findMany({ where: { userId: member.id, proposal: { eventId: event.id } } });
      expect(reviews.every((r) => r.dismissedAt === null)).toBe(true);
    });

    it('throws if user lacks canDismissReviews', async () => {
      const authorizedTeam = await getAuthorizedTeam(member.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      await expect(ReviewerActions.for(authorizedEvent).restoreReviewsByUser(owner.id)).rejects.toThrow(
        ForbiddenOperationError,
      );
    });
  });
});
