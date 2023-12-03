import type { Event, Proposal, Team, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';

import { ForbiddenOperationError } from '~/libs/errors';

import { ResultsAnnouncement } from './ResultsAnnouncement';

describe('ResultsAnnouncement', () => {
  let owner: User, member: User, reviewer: User, speaker1: User, speaker2: User;
  let proposal: Proposal, proposalSubmitted: Proposal;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory();
    member = await userFactory();
    reviewer = await userFactory();
    speaker1 = await userFactory({ attributes: { email: 'speaker1@example.com' } });
    speaker2 = await userFactory({ attributes: { email: 'speaker2@example.com' } });
    team = await teamFactory({ owners: [owner], members: [member], reviewers: [reviewer] });
    event = await eventFactory({ team });
    proposal = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1, speaker2] }),
      traits: ['accepted'],
    });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1, speaker2] }), traits: ['accepted'] });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1] }), traits: ['rejected'] });
    await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1, speaker2] }),
      traits: ['accepted'],
      withResultPublished: true,
    });
    proposalSubmitted = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1, speaker2] }),
      traits: ['submitted'],
    });
    const event2 = await eventFactory({ team });
    await proposalFactory({
      event: event2,
      talk: await talkFactory({ speakers: [speaker1, speaker2] }),
      traits: ['accepted'],
    });
  });

  describe('#statistics', () => {
    it('returns results statistics for the event', async () => {
      const announcement = ResultsAnnouncement.for(owner.id, team.slug, event.slug);
      const count = await announcement.statistics();
      expect(count).toEqual({
        submitted: 1,
        accepted: { total: 3, published: 1, notPublished: 2 },
        rejected: { total: 1, published: 0, notPublished: 1 },
      });
    });
  });

  describe('#publishAll', () => {
    it('publish for the even all results for accepted proposals not already announced', async () => {
      const announcement = ResultsAnnouncement.for(owner.id, team.slug, event.slug);

      const count = await announcement.statistics();
      expect(count.accepted).toEqual({ total: 3, published: 1, notPublished: 2 });

      await announcement.publishAll('ACCEPTED', true);

      const countAccepted = await announcement.statistics();
      expect(countAccepted.accepted).toEqual({ total: 3, published: 3, notPublished: 0 });
      expect([
        {
          from: `${event.name} <no-reply@conference-hall.io>`,
          to: [speaker1.email, speaker2.email],
          subject: `[${event.name}] Your talk has been accepted`,
        },
        {
          from: `${event.name} <no-reply@conference-hall.io>`,
          to: [speaker1.email, speaker2.email],
          subject: `[${event.name}] Your talk has been accepted`,
        },
      ]).toHaveEmailsEnqueued();
    });

    it('publish for the even all results for rejected proposals not already announced', async () => {
      const announcement = ResultsAnnouncement.for(owner.id, team.slug, event.slug);

      const count = await announcement.statistics();
      expect(count.rejected).toEqual({ total: 1, published: 0, notPublished: 1 });

      await announcement.publishAll('REJECTED', true);

      const countRejected = await announcement.statistics();
      expect(countRejected.rejected).toEqual({ total: 1, published: 1, notPublished: 0 });
      expect([
        {
          from: `${event.name} <no-reply@conference-hall.io>`,
          to: [speaker1.email],
          subject: `[${event.name}] Your talk has been declined`,
        },
      ]).toHaveEmailsEnqueued();
    });

    it('can be sent by team members', async () => {
      const announcement = ResultsAnnouncement.for(member.id, team.slug, event.slug);
      await announcement.publishAll('ACCEPTED', true);
      const count = await announcement.statistics();
      expect(count.accepted).toEqual({ total: 3, published: 3, notPublished: 0 });
    });

    it('cannot be sent by team reviewers', async () => {
      const announcement = ResultsAnnouncement.for(reviewer.id, team.slug, event.slug);
      await expect(announcement.publishAll('ACCEPTED', false)).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#publishOne', () => {
    it('publish result a specific proposal', async () => {
      const announcement = ResultsAnnouncement.for(owner.id, team.slug, event.slug);

      const count = await announcement.statistics();
      expect(count.accepted).toEqual({ total: 3, published: 1, notPublished: 2 });

      await announcement.publish(proposal.id, true);

      const countAccepted = await announcement.statistics();
      expect(countAccepted.accepted).toEqual({ total: 3, published: 2, notPublished: 1 });
      expect([
        {
          from: `${event.name} <no-reply@conference-hall.io>`,
          to: [speaker1.email, speaker2.email],
          subject: `[${event.name}] Your talk has been accepted`,
        },
      ]).toHaveEmailsEnqueued();
    });

    it('can be sent by team members', async () => {
      const announcement = ResultsAnnouncement.for(member.id, team.slug, event.slug);
      await announcement.publish(proposal.id, false);
      const count = await announcement.statistics();
      expect(count.accepted).toEqual({ total: 3, published: 2, notPublished: 1 });
    });

    it('cannot publish result for a proposal not accepted or rejected', async () => {
      const announcement = ResultsAnnouncement.for(owner.id, team.slug, event.slug);
      await expect(announcement.publish(proposalSubmitted.id, false)).rejects.toThrowError(ForbiddenOperationError);
    });

    it('cannot be sent by team reviewers', async () => {
      const announcement = ResultsAnnouncement.for(reviewer.id, team.slug, event.slug);
      await expect(announcement.publish(proposal.id, false)).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#unpublish', () => {
    it('unpublish result for a list of proposals', async () => {
      const announcement = ResultsAnnouncement.for(owner.id, team.slug, event.slug);

      await announcement.publish(proposal.id, false);

      const before = await announcement.statistics();
      expect(before.accepted).toEqual({ total: 3, published: 2, notPublished: 1 });

      await announcement.unpublish([proposal.id]);
      const after = await announcement.statistics();
      expect(after.accepted).toEqual({ total: 3, published: 1, notPublished: 2 });
    });
  });
});
