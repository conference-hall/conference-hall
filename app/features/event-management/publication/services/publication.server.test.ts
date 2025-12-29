import { db } from 'prisma/db.server.ts';
import type { Event, Proposal, Team, User } from 'prisma/generated/client.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import { ForbiddenOperationError, ProposalNotFoundError } from '~/shared/errors.server.ts';
import { ProposalStatusUpdater } from '../../proposals/services/proposal-status-updater.server.ts';
import { Publication } from './publication.server.ts';

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
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const count = await Publication.for(authorizedEvent).statistics();
      expect(count).toEqual({
        deliberation: { total: 7, pending: 1, accepted: 5, rejected: 1 },
        accepted: { published: 3, notPublished: 2 },
        rejected: { published: 0, notPublished: 1 },
        confirmations: { pending: 1, confirmed: 1, declined: 1 },
      });
    });

    it('excludes archived proposals from statistics', async () => {
      const archivedAccepted = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker1] }),
        traits: ['accepted'],
      });
      const archivedRejected = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker1] }),
        traits: ['rejected'],
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await ProposalStatusUpdater.for(authorizedEvent).archive([archivedAccepted.id, archivedRejected.id]);

      const count = await Publication.for(authorizedEvent).statistics();

      expect(count).toEqual({
        deliberation: { total: 7, pending: 1, accepted: 5, rejected: 1 },
        accepted: { published: 3, notPublished: 2 },
        rejected: { published: 0, notPublished: 1 },
        confirmations: { pending: 1, confirmed: 1, declined: 1 },
      });
    });

    it('cannot be see by team reviewers', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(Publication.for(authorizedEvent).statistics()).rejects.toThrowError(ForbiddenOperationError);
    });

    it('cannot be see for meetup event', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, meetup.slug);

      await expect(Publication.for(authorizedEvent).statistics()).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#publishAll', () => {
    it('publish for the even all results for accepted proposals not already announced', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const count = await Publication.for(authorizedEvent).statistics();
      expect(count.accepted).toEqual({ published: 3, notPublished: 2 });

      await Publication.for(authorizedEvent).publishAll('ACCEPTED', true);

      const countAccepted = await Publication.for(authorizedEvent).statistics();
      expect(countAccepted.accepted).toEqual({ published: 5, notPublished: 0 });

      expect(sendEmail.trigger).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          template: 'speakers-proposal-accepted',
          to: expect.arrayContaining([speaker1.email, speaker2.email]),
        }),
      );

      expect(sendEmail.trigger).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          template: 'speakers-proposal-accepted',
          to: expect.arrayContaining([speaker1.email, speaker2.email]),
        }),
      );
    });

    it('publish for the even all results for rejected proposals not already announced', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const count = await Publication.for(authorizedEvent).statistics();
      expect(count.rejected).toEqual({ published: 0, notPublished: 1 });

      await Publication.for(authorizedEvent).publishAll('REJECTED', true);

      const countRejected = await Publication.for(authorizedEvent).statistics();
      expect(countRejected.rejected).toEqual({ published: 1, notPublished: 0 });

      expect(sendEmail.trigger).toHaveBeenCalledWith(
        expect.objectContaining({
          template: 'speakers-proposal-rejected',
          to: [speaker1.email],
        }),
      );
    });

    it('does not publish archived proposals when publishing all accepted', async () => {
      const uniqueSpeaker = await userFactory({ attributes: { email: 'unique-speaker@example.com' } });
      const archivedProposal = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [uniqueSpeaker] }),
        traits: ['accepted'],
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await ProposalStatusUpdater.for(authorizedEvent).archive([archivedProposal.id]);

      await Publication.for(authorizedEvent).publishAll('ACCEPTED', true);

      const updated = await db.proposal.findUnique({ where: { id: archivedProposal.id } });
      expect(updated?.publicationStatus).toBe('NOT_PUBLISHED');
      expect(sendEmail.trigger).not.toHaveBeenCalledWith(
        expect.objectContaining({ to: expect.arrayContaining([uniqueSpeaker.email]) }),
      );
    });

    it('can be sent by team members', async () => {
      const authorizedTeam = await getAuthorizedTeam(member.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await Publication.for(authorizedEvent).publishAll('ACCEPTED', true);
      const count = await Publication.for(authorizedEvent).statistics();
      expect(count.accepted).toEqual({ published: 5, notPublished: 0 });
    });

    it('cannot be sent by team reviewers', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(Publication.for(authorizedEvent).publishAll('ACCEPTED', false)).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('cannot be sent to all for meetup event', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, meetup.slug);

      await expect(Publication.for(authorizedEvent).statistics()).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#publish', () => {
    it('publish result an accepted proposal', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const count = await Publication.for(authorizedEvent).statistics();
      expect(count.accepted).toEqual({ published: 3, notPublished: 2 });

      await Publication.for(authorizedEvent).publish(proposal.id, true);

      const countAccepted = await Publication.for(authorizedEvent).statistics();
      expect(countAccepted.accepted).toEqual({ published: 4, notPublished: 1 });

      expect(sendEmail.trigger).toHaveBeenCalledWith(
        expect.objectContaining({
          template: 'speakers-proposal-accepted',
          to: expect.arrayContaining([speaker1.email, speaker2.email]),
        }),
      );
    });

    it('publish result a rejected proposal', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const count = await Publication.for(authorizedEvent).statistics();
      expect(count.rejected).toEqual({ published: 0, notPublished: 1 });

      await Publication.for(authorizedEvent).publish(rejectedProposal.id, true);

      const countRejected = await Publication.for(authorizedEvent).statistics();
      expect(countRejected.rejected).toEqual({ published: 1, notPublished: 0 });

      expect(sendEmail.trigger).toHaveBeenCalledWith(
        expect.objectContaining({
          template: 'speakers-proposal-rejected',
          to: [speaker1.email],
        }),
      );
    });

    it('can be sent by team members', async () => {
      const authorizedTeam = await getAuthorizedTeam(member.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await Publication.for(authorizedEvent).publish(proposal.id, false);
      const count = await Publication.for(authorizedEvent).statistics();
      expect(count.accepted).toEqual({ published: 4, notPublished: 1 });
    });

    it('cannot publish result for a proposal not accepted or rejected', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(Publication.for(authorizedEvent).publish(proposalSubmitted.id, false)).rejects.toThrowError(
        ProposalNotFoundError,
      );
    });

    it('cannot publish an archived proposal', async () => {
      const archivedProposal = await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker1] }),
        traits: ['accepted'],
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await ProposalStatusUpdater.for(authorizedEvent).archive([archivedProposal.id]);

      await expect(Publication.for(authorizedEvent).publish(archivedProposal.id, true)).rejects.toThrowError(
        ProposalNotFoundError,
      );
    });

    it('cannot be sent by team reviewers', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(Publication.for(authorizedEvent).publish(proposal.id, false)).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });
});
