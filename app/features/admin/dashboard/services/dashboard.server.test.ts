import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import type { User } from '../../../../../prisma/generated/client.ts';
import { AdminDashboard } from './dashboard.server.ts';

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

  describe('#usersMetrics', () => {
    it('returns metrics for users', async () => {
      const metrics = await AdminDashboard.for(admin).usersMetrics();

      expect(metrics).toEqual({ total: 3, organizers: 2, speakers: 1 });
    });
  });

  describe('#eventsMetrics', () => {
    it('returns metrics for conferences', async () => {
      const metrics = await AdminDashboard.for(admin).eventsMetrics('CONFERENCE');

      expect(metrics).toEqual({ total: 2, public: 1, private: 1, cfpOpen: 1 });
    });

    it('returns metrics for meetups', async () => {
      const metrics = await AdminDashboard.for(admin).eventsMetrics('MEETUP');

      expect(metrics).toEqual({ total: 2, public: 1, private: 1, cfpOpen: 1 });
    });
  });

  describe('#teamsMetrics', () => {
    it('returns metrics for teams', async () => {
      const metrics = await AdminDashboard.for(admin).teamsMetrics();

      expect(metrics).toEqual({ total: 1, organizers: 2, owners: 1, members: 1, reviewers: 0 });
    });
  });

  describe('#proposalsMetrics', () => {
    it('returns metrics for proposals', async () => {
      const metrics = await AdminDashboard.for(admin).proposalsMetrics();

      expect(metrics).toEqual({ total: 5, submitted: 4, draft: 1, withoutProposalNumber: 0 });
    });
  });
});
