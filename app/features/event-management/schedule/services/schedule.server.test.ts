import type { Event, Schedule, ScheduleTrack, Team, User } from 'prisma/generated/client.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { scheduleFactory } from 'tests/factories/schedule.ts';
import { scheduleTrackFactory } from 'tests/factories/schedule-track.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { ForbiddenError, ForbiddenOperationError, NotFoundError } from '~/shared/errors.server.ts';
import { EventSchedule } from './schedule.server.ts';

describe('EventSchedule', () => {
  let owner: User;
  let reviewer: User;
  let team: Team;
  let event: Event;
  let schedule: Schedule;
  let track: ScheduleTrack;
  let track2: ScheduleTrack;

  beforeEach(async () => {
    owner = await userFactory();
    reviewer = await userFactory();
    team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ team, traits: ['conference'], attributes: { apiKey: '123' } });
    schedule = await scheduleFactory({ event });
    track = await scheduleTrackFactory({ name: 'Room 1', schedule });
    track2 = await scheduleTrackFactory({ name: 'Room 2', schedule });
    await eventFactory({ team, traits: ['conference', 'withSchedule'] });
  });

  describe('#get', () => {
    it('get schedule', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const actual = await EventSchedule.for(authorizedEvent).get();
      expect(actual).toEqual({
        id: schedule.id,
        name: schedule.name,
        start: schedule.start,
        end: schedule.end,
        timezone: 'Europe/Paris',
        tracks: [
          { id: track.id, name: track.name },
          { id: track2.id, name: track2.name },
        ],
      });
    });

    it('returns null when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, eventWithoutSchedule.slug);

      const actual = await EventSchedule.for(authorizedEvent).get();
      expect(actual).toBe(null);
    });

    it('throws forbidden error for reviewers', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(EventSchedule.for(authorizedEvent).get()).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, meetup.slug);

      await expect(EventSchedule.for(authorizedEvent).get()).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#create', () => {
    const expected = { name: 'My schedule', timezone: 'Europe/Paris', start: new Date(), end: new Date() };

    it('create a schedule', async () => {
      const event = await eventFactory({ team, traits: ['conference'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await EventSchedule.for(authorizedEvent).create(expected);

      const actual = await EventSchedule.for(authorizedEvent).get();
      expect(actual?.name).toEqual('My schedule');
      expect(actual?.timezone).toEqual('Europe/Paris');
      expect(actual?.start).toEqual(expected.start);
      expect(actual?.end).toEqual(expected.end);
      expect(actual?.tracks.at(0)?.name).toEqual('Main stage');
    });

    it('throws forbidden error for reviewers', async () => {
      const event = await eventFactory({ team, traits: ['conference'] });
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(EventSchedule.for(authorizedEvent).create(expected)).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, meetup.slug);

      await expect(EventSchedule.for(authorizedEvent).create(expected)).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#update', () => {
    const expected = { name: 'My schedule', start: new Date(), end: new Date() };

    it('updates schedule settings', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await EventSchedule.for(authorizedEvent).update(expected);

      const actual = await EventSchedule.for(authorizedEvent).get();
      expect(actual?.name).toEqual(expected.name);
      expect(actual?.start).toEqual(expected.start);
      expect(actual?.end).toEqual(expected.end);
    });

    it('throws not found Error when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, eventWithoutSchedule.slug);

      await expect(EventSchedule.for(authorizedEvent).update(expected)).rejects.toThrowError(NotFoundError);
    });

    it('throws forbidden error for reviewers', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(EventSchedule.for(authorizedEvent).update(expected)).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, meetup.slug);

      await expect(EventSchedule.for(authorizedEvent).update(expected)).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#delete', () => {
    it('deletes a schedule', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await EventSchedule.for(authorizedEvent).delete();

      const actual = await EventSchedule.for(authorizedEvent).get();
      expect(actual).toBe(null);
    });

    it('throws not found Error when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, eventWithoutSchedule.slug);

      await expect(EventSchedule.for(authorizedEvent).delete()).rejects.toThrowError(NotFoundError);
    });

    it('throws forbidden error for reviewers', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(EventSchedule.for(authorizedEvent).delete()).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, meetup.slug);

      await expect(EventSchedule.for(authorizedEvent).delete()).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#addSession', () => {
    it('adds a session to a schedule', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const session = await EventSchedule.for(authorizedEvent).addSession({
        trackId: track.id,
        start: new Date(schedule.start),
        end: new Date(schedule.end),
      });

      expect(session?.trackId).toBe(track.id);
      expect(session?.start).toEqual(schedule.start);
      expect(session?.end).toEqual(schedule.end);
      expect(session?.proposalId).toBe(null);
    });

    it('throws not found Error when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, eventWithoutSchedule.slug);

      await expect(
        EventSchedule.for(authorizedEvent).addSession({
          trackId: 'track',
          start: new Date(schedule.start),
          end: new Date(schedule.end),
        }),
      ).rejects.toThrowError(NotFoundError);
    });

    it('throws forbidden error for reviewers', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(
        EventSchedule.for(authorizedEvent).addSession({
          trackId: 'track',
          start: new Date(schedule.start),
          end: new Date(schedule.end),
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, meetup.slug);

      await expect(
        EventSchedule.for(authorizedEvent).addSession({
          trackId: 'track',
          start: new Date(schedule.start),
          end: new Date(schedule.end),
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#updateSession', () => {
    it('updates a session with a proposal', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const session = await EventSchedule.for(authorizedEvent).addSession({
        trackId: track.id,
        start: new Date(schedule.start),
        end: new Date(schedule.start),
      });

      const talk = await talkFactory({ speakers: [owner] });
      const proposal = await proposalFactory({ event, talk });
      const actual = await EventSchedule.for(authorizedEvent).updateSession({
        id: session.id,
        trackId: track2.id,
        color: 'gray',
        language: 'fr',
        emojis: ['heart'],
        start: new Date(schedule.end),
        end: new Date(schedule.end),
        proposalId: proposal.id,
      });

      expect(actual?.trackId).toBe(track2.id);
      expect(actual?.start).toEqual(schedule.end);
      expect(actual?.end).toEqual(schedule.end);
      expect(actual?.language).toEqual('fr');
      expect(actual?.emojis).toEqual(['heart']);
      expect(actual?.proposalId).toBe(proposal.id);
    });

    it('updates a session without a proposal', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const session = await EventSchedule.for(authorizedEvent).addSession({
        trackId: track.id,
        start: new Date(schedule.start),
        end: new Date(schedule.start),
      });

      const actual = await EventSchedule.for(authorizedEvent).updateSession({
        id: session.id,
        trackId: track.id,
        color: 'gray',
        language: 'fr',
        emojis: ['heart'],
        start: new Date(schedule.end),
        end: new Date(schedule.end),
      });

      expect(actual?.trackId).toBe(track.id);
      expect(actual?.start).toEqual(schedule.end);
      expect(actual?.end).toEqual(schedule.end);
      expect(actual?.language).toEqual('fr');
      expect(actual?.emojis).toEqual(['heart']);
    });

    it('throws not found Error when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, eventWithoutSchedule.slug);

      await expect(
        EventSchedule.for(authorizedEvent).updateSession({
          id: 'id',
          trackId: 'track',
          color: 'gray',
          emojis: [],
          start: new Date(schedule.end),
          end: new Date(schedule.end),
          proposalId: 'proposal',
        }),
      ).rejects.toThrowError(NotFoundError);
    });

    it('throws forbidden error for reviewers', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(
        EventSchedule.for(authorizedEvent).updateSession({
          id: 'id',
          trackId: 'track',
          color: 'gray',
          emojis: [],
          start: new Date(schedule.end),
          end: new Date(schedule.end),
          proposalId: 'proposal',
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, meetup.slug);

      await expect(
        EventSchedule.for(authorizedEvent).updateSession({
          id: 'id',
          trackId: 'track',
          color: 'gray',
          emojis: [],
          start: new Date(schedule.end),
          end: new Date(schedule.end),
          proposalId: 'proposal',
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#deleteSession', () => {
    it('deletes a session from a schedule', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const session = await EventSchedule.for(authorizedEvent).addSession({
        trackId: track.id,
        start: new Date(schedule.start),
        end: new Date(schedule.start),
      });

      await EventSchedule.for(authorizedEvent).deleteSession(session.id);

      const actual = await EventSchedule.for(authorizedEvent).getScheduleSessions();
      expect(actual?.sessions.length).toBe(0);
    });

    it('throws not found Error when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, eventWithoutSchedule.slug);

      await expect(EventSchedule.for(authorizedEvent).deleteSession('sessionId')).rejects.toThrowError(NotFoundError);
    });

    it('throws forbidden error for reviewers', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(EventSchedule.for(authorizedEvent).deleteSession('sessionId')).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, meetup.slug);

      await expect(EventSchedule.for(authorizedEvent).deleteSession('sessionId')).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });

  describe('#saveTracks', () => {
    it('adds a new track', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await EventSchedule.for(authorizedEvent).saveTracks([track, track2, { id: 'NEW-track3', name: 'Room 3' }]);

      const actual = await EventSchedule.for(authorizedEvent).get();
      expect(actual?.tracks[0].name).toBe('Room 1');
      expect(actual?.tracks[1].name).toBe('Room 2');
      expect(actual?.tracks[2].name).toBe('Room 3');
    });

    it('updates a track', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await EventSchedule.for(authorizedEvent).saveTracks([track, { ...track2, name: 'Room 2 updated' }]);

      const actual = await EventSchedule.for(authorizedEvent).get();
      expect(actual?.tracks[0].name).toBe('Room 1');
      expect(actual?.tracks[1].name).toBe('Room 2 updated');
    });

    it('deletes a track', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await EventSchedule.for(authorizedEvent).saveTracks([track]);

      const actual = await EventSchedule.for(authorizedEvent).get();
      expect(actual?.tracks.length).toBe(1);
      expect(actual?.tracks[0].name).toBe('Room 1');
    });

    it('must remain at least one track', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(EventSchedule.for(authorizedEvent).saveTracks([])).rejects.toThrowError(ForbiddenError);
    });

    it('throws not found Error when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, eventWithoutSchedule.slug);

      await expect(EventSchedule.for(authorizedEvent).saveTracks([])).rejects.toThrowError(NotFoundError);
    });

    it('throws forbidden error for reviewers', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(EventSchedule.for(authorizedEvent).saveTracks([])).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, meetup.slug);

      await expect(EventSchedule.for(authorizedEvent).saveTracks([])).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#getScheduleSessions', () => {
    it('get schedule data and sessions', async () => {
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
        emojis: ['heart'],
        start: new Date(schedule.start),
        end: new Date(schedule.start),
        proposalId: proposal.id,
      });

      const scheduleSessions = await EventSchedule.for(authorizedEvent).getScheduleSessions();
      expect(scheduleSessions).toEqual({
        name: schedule.name,
        start: schedule.start,
        end: schedule.end,
        timezone: 'Europe/Paris',
        displayEndMinutes: 1080,
        displayStartMinutes: 540,
        tracks: [
          { id: track.id, name: track.name },
          { id: track2.id, name: track2.name },
        ],
        sessions: [
          {
            id: session.id,
            trackId: session.trackId,
            start: session.start,
            end: session.end,
            name: null,
            language: 'en',
            emojis: ['heart'],
            color: 'gray',
            proposal: {
              id: proposal.id,
              title: proposal.title,
              confirmationStatus: proposal.confirmationStatus,
              deliberationStatus: proposal.deliberationStatus,
              categories: [],
              formats: [],
              speakers: [
                {
                  id: proposal.speakers.at(0)?.id,
                  name: proposal.speakers.at(0)?.name,
                  picture: proposal.speakers.at(0)?.picture,
                  company: proposal.speakers.at(0)?.company,
                },
              ],
            },
          },
        ],
      });
    });

    it('returns null when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, eventWithoutSchedule.slug);

      const result = await EventSchedule.for(authorizedEvent).getScheduleSessions();
      expect(result).toBe(null);
    });

    it('throws forbidden error for reviewers', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      await expect(EventSchedule.for(authorizedEvent).getScheduleSessions()).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, meetup.slug);

      await expect(EventSchedule.for(authorizedEvent).getScheduleSessions()).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });
});
