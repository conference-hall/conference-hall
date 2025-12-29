import type { Event, Schedule, ScheduleTrack, Team, User } from 'prisma/generated/client.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { scheduleFactory } from 'tests/factories/schedule.ts';
import { scheduleTrackFactory } from 'tests/factories/schedule-track.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { EventSchedule } from './schedule.server.ts';
import { EventScheduleExport } from './schedule-export.server.ts';

describe('EventScheduleExport', () => {
  let owner: User;
  let reviewer: User;
  let team: Team;
  let event: Event;
  let schedule: Schedule;
  let track: ScheduleTrack;

  beforeEach(async () => {
    owner = await userFactory();
    reviewer = await userFactory();
    team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ team, traits: ['conference'], attributes: { apiKey: '123' } });
    schedule = await scheduleFactory({ event });
    track = await scheduleTrackFactory({ name: 'Room 1', schedule });
    await scheduleTrackFactory({ name: 'Room 2', schedule });
    await eventFactory({ team, traits: ['conference', 'withSchedule'] });
  });

  describe('#forJsonExport', () => {
    it('exports schedule as JSON', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const session = await EventSchedule.for(authorizedEvent).addSession({
        trackId: track.id,
        start: new Date(schedule.start),
        end: new Date(schedule.start),
      });
      const talk = await talkFactory({ speakers: [owner] });
      const proposal = await proposalFactory({ event, talk });
      await EventSchedule.for(authorizedEvent).updateSession({
        id: session.id,
        trackId: track.id,
        color: 'gray',
        emojis: [],
        start: new Date(schedule.start),
        end: new Date(schedule.start),
        proposalId: proposal.id,
      });

      const json = await EventScheduleExport.for(authorizedEvent).forJsonExport();

      expect(json).toEqual({
        name: schedule.name,
        days: expect.any(Array),
        timeZone: schedule.timezone,
        sessions: [
          {
            id: session.id,
            start: expect.any(String),
            end: expect.any(String),
            track: track.name,
            title: proposal.title,
            language: 'en',
            proposal: {
              id: proposal.id,
              proposalNumber: proposal.proposalNumber,
              abstract: proposal.abstract,
              level: proposal.level || null,
              formats: [],
              categories: [],
              speakers: [
                {
                  id: proposal.speakers.at(0)?.id,
                  name: proposal.speakers.at(0)?.name,
                  bio: proposal.speakers.at(0)?.bio || null,
                  company: proposal.speakers.at(0)?.company || null,
                  picture: proposal.speakers.at(0)?.picture || null,
                  socialLinks: proposal.speakers.at(0)?.socialLinks,
                },
              ],
            },
          },
        ],
      });
    });

    it('throws forbidden error for reviewers', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(EventScheduleExport.for(authorizedEvent).forJsonExport()).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, meetup.slug);

      await expect(EventScheduleExport.for(authorizedEvent).forJsonExport()).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });
});
