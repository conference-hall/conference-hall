import type { User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { NotAuthorizedError } from '~/libs/errors.server.ts';
import { AdminDashboard } from './admin-dashboard.ts';

describe('AdminDashboard', () => {
  let admin: User;
  let speaker: User;

  beforeEach(async () => {
    admin = await userFactory({ traits: ['clark-kent', 'admin'] });
    speaker = await userFactory({ traits: ['bruce-wayne'] });
    const member = await userFactory({ traits: ['peter-parker'] });
    const team = await teamFactory({ owners: [admin], members: [member] });

    const conferenceOpen = await eventFactory({ team, creator: member, traits: ['conference-cfp-open'] });
    const conferenceClose = await eventFactory({ team, creator: member, traits: ['conference-cfp-future', 'private'] });
    const meetupOpen = await eventFactory({ team, creator: member, traits: ['meetup-cfp-open'] });
    const meetupClose = await eventFactory({ team, creator: member, traits: ['meetup-cfp-close', 'private'] });

    const talk1 = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event: conferenceOpen, talk: talk1, traits: ['draft'] });

    const talk2 = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event: conferenceOpen, talk: talk2 });
    await proposalFactory({ event: conferenceClose, talk: talk2 });
    await proposalFactory({ event: meetupOpen, talk: talk2 });
    await proposalFactory({ event: meetupClose, talk: talk2 });
  });

  describe('AdminDashboard.for', () => {
    it('throws an error when user is not admin', async () => {
      await expect(AdminDashboard.for(speaker.id)).rejects.toThrowError(NotAuthorizedError);
    });
  });

  describe('#usersMetrics', () => {
    it('returns metrics for users', async () => {
      const dashboard = await AdminDashboard.for(admin.id);
      const metrics = await dashboard.usersMetrics();

      expect(metrics).toEqual({ total: 3, organizers: 2, speakers: 1 });
    });
  });

  describe('#eventsMetrics', () => {
    it('returns metrics for conferences', async () => {
      const dashboard = await AdminDashboard.for(admin.id);
      const metrics = await dashboard.eventsMetrics('CONFERENCE');

      expect(metrics).toEqual({ total: 2, public: 1, private: 1, cfpOpen: 1 });
    });

    it('returns metrics for meetups', async () => {
      const dashboard = await AdminDashboard.for(admin.id);
      const metrics = await dashboard.eventsMetrics('MEETUP');

      expect(metrics).toEqual({ total: 2, public: 1, private: 1, cfpOpen: 1 });
    });
  });

  describe('#teamsMetrics', () => {
    it('returns metrics for teams', async () => {
      const dashboard = await AdminDashboard.for(admin.id);
      const metrics = await dashboard.teamsMetrics();

      expect(metrics).toEqual({ total: 1, organizers: 2, owners: 1, members: 1, reviewers: 0 });
    });
  });

  describe('#proposalsMetrics', () => {
    it('returns metrics for proposals', async () => {
      const dashboard = await AdminDashboard.for(admin.id);
      const metrics = await dashboard.proposalsMetrics();

      expect(metrics).toEqual({ total: 5, submitted: 4, draft: 1 });
    });
  });
});
