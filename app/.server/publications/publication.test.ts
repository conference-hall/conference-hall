import type { Event, Proposal, Team, User } from '@prisma/client/app/index.js';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ForbiddenOperationError, ProposalNotFoundError } from '~/libs/errors.server.ts';

import { sendEmail } from '~/emails/send-email.job.ts';
import { Publication } from './publication.ts';

describe('Publication', () => {
  let owner: User;
  let member: User;
  let reviewer: User;
  let speaker1: User;
  let speaker2: User;
  let proposal: Proposal;
  let rejectedProposal: Proposal;
  let proposalSubmitted: Proposal;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory();
    member = await userFactory();
    reviewer = await userFactory();
    speaker1 = await userFactory({ attributes: { email: 'speaker1@example.com' } });
    speaker2 = await userFactory({ attributes: { email: 'speaker2@example.com' } });
    team = await teamFactory({ owners: [owner], members: [member], reviewers: [reviewer] });
    event = await eventFactory({ team, traits: ['conference'] });
    proposal = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1, speaker2] }),
      traits: ['accepted'],
    });
    rejectedProposal = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1] }),
      traits: ['rejected'],
    });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1, speaker2] }), traits: ['accepted'] });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1] }), traits: ['confirmed'] });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1] }), traits: ['declined'] });
    await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1, speaker2] }),
      traits: ['accepted-published'],
    });
    proposalSubmitted = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1, speaker2] }),
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
      const publication = Publication.for(owner.id, team.slug, event.slug);
      const count = await publication.statistics();
      expect(count).toEqual({
        deliberation: { total: 7, pending: 1, accepted: 5, rejected: 1 },
        accepted: { published: 3, notPublished: 2 },
        rejected: { published: 0, notPublished: 1 },
        confirmations: { pending: 1, confirmed: 1, declined: 1 },
      });
    });

    it('cannot be see by team reviewers', async () => {
      const publication = Publication.for(reviewer.id, team.slug, event.slug);
      await expect(publication.statistics()).rejects.toThrowError(ForbiddenOperationError);
    });

    it('cannot be see for meetup event', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      const publication = Publication.for(owner.id, team.slug, meetup.slug);
      await expect(publication.statistics()).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#publishAll', () => {
    it('publish for the even all results for accepted proposals not already announced', async () => {
      const publication = Publication.for(owner.id, team.slug, event.slug);

      const count = await publication.statistics();
      expect(count.accepted).toEqual({ published: 3, notPublished: 2 });

      await publication.publishAll('ACCEPTED', true);

      const countAccepted = await publication.statistics();
      expect(countAccepted.accepted).toEqual({ published: 5, notPublished: 0 });

      expect(sendEmail.trigger).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          template: 'speakers/proposal-accepted',
          to: [speaker1.email, speaker2.email],
        }),
      );

      expect(sendEmail.trigger).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          template: 'speakers/proposal-accepted',
          to: [speaker1.email, speaker2.email],
        }),
      );
    });

    it('publish for the even all results for rejected proposals not already announced', async () => {
      const publication = Publication.for(owner.id, team.slug, event.slug);

      const count = await publication.statistics();
      expect(count.rejected).toEqual({ published: 0, notPublished: 1 });

      await publication.publishAll('REJECTED', true);

      const countRejected = await publication.statistics();
      expect(countRejected.rejected).toEqual({ published: 1, notPublished: 0 });

      expect(sendEmail.trigger).toHaveBeenCalledWith(
        expect.objectContaining({
          template: 'speakers/proposal-rejected',
          to: [speaker1.email],
        }),
      );
    });

    it('can be sent by team members', async () => {
      const publication = Publication.for(member.id, team.slug, event.slug);
      await publication.publishAll('ACCEPTED', true);
      const count = await publication.statistics();
      expect(count.accepted).toEqual({ published: 5, notPublished: 0 });
    });

    it('cannot be sent by team reviewers', async () => {
      const publication = Publication.for(reviewer.id, team.slug, event.slug);
      await expect(publication.publishAll('ACCEPTED', false)).rejects.toThrowError(ForbiddenOperationError);
    });

    it('cannot be sent to all for meetup event', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      const publication = Publication.for(owner.id, team.slug, meetup.slug);
      await expect(publication.statistics()).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#publish', () => {
    it('publish result an accepted proposal', async () => {
      const publication = Publication.for(owner.id, team.slug, event.slug);

      const count = await publication.statistics();
      expect(count.accepted).toEqual({ published: 3, notPublished: 2 });

      await publication.publish(proposal.id, true);

      const countAccepted = await publication.statistics();
      expect(countAccepted.accepted).toEqual({ published: 4, notPublished: 1 });

      expect(sendEmail.trigger).toHaveBeenCalledWith(
        expect.objectContaining({
          template: 'speakers/proposal-accepted',
          to: [speaker1.email, speaker2.email],
        }),
      );
    });

    it('publish result a rejected proposal', async () => {
      const publication = Publication.for(owner.id, team.slug, event.slug);

      const count = await publication.statistics();
      expect(count.rejected).toEqual({ published: 0, notPublished: 1 });

      await publication.publish(rejectedProposal.id, true);

      const countRejected = await publication.statistics();
      expect(countRejected.rejected).toEqual({ published: 1, notPublished: 0 });

      expect(sendEmail.trigger).toHaveBeenCalledWith(
        expect.objectContaining({
          template: 'speakers/proposal-rejected',
          to: [speaker1.email],
        }),
      );
    });

    it('can be sent by team members', async () => {
      const publication = Publication.for(member.id, team.slug, event.slug);
      await publication.publish(proposal.id, false);
      const count = await publication.statistics();
      expect(count.accepted).toEqual({ published: 4, notPublished: 1 });
    });

    it('cannot publish result for a proposal not accepted or rejected', async () => {
      const publication = Publication.for(owner.id, team.slug, event.slug);
      await expect(publication.publish(proposalSubmitted.id, false)).rejects.toThrowError(ProposalNotFoundError);
    });

    it('cannot be sent by team reviewers', async () => {
      const publication = Publication.for(reviewer.id, team.slug, event.slug);
      await expect(publication.publish(proposal.id, false)).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
