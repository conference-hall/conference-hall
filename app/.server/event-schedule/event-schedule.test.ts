import type { Event, Schedule, Team, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { scheduleFactory } from 'tests/factories/schedule.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ForbiddenError, ForbiddenOperationError, NotFoundError } from '~/libs/errors.server.ts';

import { EventSchedule } from './event-schedule.ts';

describe('EventSchedule', () => {
  let owner: User;
  let reviewer: User;
  let team: Team;
  let event: Event;
  let schedule: Schedule;

  beforeEach(async () => {
    owner = await userFactory();
    reviewer = await userFactory();
    team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ team, traits: ['conference'] });
    schedule = await scheduleFactory({ event });
    await eventFactory({ team, traits: ['conference', 'withSchedule'] });
  });

  describe('#get', () => {
    it('get schedule', async () => {
      const eventSchedule = EventSchedule.for(owner.id, team.slug, event.slug);
      const track = await eventSchedule.saveTrack({ name: 'Room' });

      const actual = await eventSchedule.get();
      expect(actual).toEqual({
        id: schedule.id,
        name: schedule.name,
        start: schedule.start.toISOString(),
        end: schedule.end.toISOString(),
        timezone: 'Europe/Paris',
        tracks: [{ id: track.id, name: track.name }],
      });
    });

    it('returns null when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      const actual = await EventSchedule.for(owner.id, team.slug, eventWithoutSchedule.slug).get();
      expect(actual).toBe(null);
    });

    it('throws forbidden error for reviewers', async () => {
      await expect(EventSchedule.for(reviewer.id, team.slug, event.slug).get()).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      await expect(EventSchedule.for(owner.id, team.slug, meetup.slug).get()).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });

  describe('#create', () => {
    const expected = { name: 'My schedule', timezone: 'Europe/Paris', start: new Date(), end: new Date() };

    it('create a schedule', async () => {
      const event = await eventFactory({ team, traits: ['conference'] });
      const eventSchedule = EventSchedule.for(owner.id, team.slug, event.slug);

      await eventSchedule.create(expected);

      const actual = await eventSchedule.get();
      expect(actual?.name).toEqual('My schedule');
      expect(actual?.timezone).toEqual('Europe/Paris');
      expect(actual?.start).toEqual(expected.start.toISOString());
      expect(actual?.end).toEqual(expected.end.toISOString());
      expect(actual?.tracks.at(0)?.name).toEqual('Main stage');
    });

    it('throws forbidden error for reviewers', async () => {
      const event = await eventFactory({ team, traits: ['conference'] });
      await expect(EventSchedule.for(reviewer.id, team.slug, event.slug).create(expected)).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      await expect(EventSchedule.for(owner.id, team.slug, meetup.slug).create(expected)).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });

  describe('#update', () => {
    const expected = { name: 'My schedule', start: new Date(), end: new Date() };

    it('updates schedule settings', async () => {
      const eventSchedule = EventSchedule.for(owner.id, team.slug, event.slug);
      await eventSchedule.update(expected);

      const actual = await eventSchedule.get();
      expect(actual?.name).toEqual(expected.name);
      expect(actual?.start).toEqual(expected.start.toISOString());
      expect(actual?.end).toEqual(expected.end.toISOString());
    });

    it('throws not found Error when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      await expect(
        EventSchedule.for(owner.id, team.slug, eventWithoutSchedule.slug).update(expected),
      ).rejects.toThrowError(NotFoundError);
    });

    it('throws forbidden error for reviewers', async () => {
      await expect(EventSchedule.for(reviewer.id, team.slug, event.slug).update(expected)).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      await expect(EventSchedule.for(owner.id, team.slug, meetup.slug).update(expected)).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });

  describe('#delete', () => {
    it('deletes a schedule', async () => {
      const eventSchedule = EventSchedule.for(owner.id, team.slug, event.slug);
      await eventSchedule.delete();

      const actual = await eventSchedule.get();
      expect(actual).toBe(null);
    });

    it('throws not found Error when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      await expect(EventSchedule.for(owner.id, team.slug, eventWithoutSchedule.slug).delete()).rejects.toThrowError(
        NotFoundError,
      );
    });

    it('throws forbidden error for reviewers', async () => {
      await expect(EventSchedule.for(reviewer.id, team.slug, event.slug).delete()).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      await expect(EventSchedule.for(owner.id, team.slug, meetup.slug).delete()).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });

  describe('#addSession', () => {
    it('adds a session to a schedule', async () => {
      const eventSchedule = EventSchedule.for(owner.id, team.slug, event.slug);
      const track = await eventSchedule.saveTrack({ name: 'Room' });

      const session = await eventSchedule.addSession({
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
      await expect(
        EventSchedule.for(owner.id, team.slug, eventWithoutSchedule.slug).addSession({
          trackId: 'track',
          start: new Date(schedule.start),
          end: new Date(schedule.end),
        }),
      ).rejects.toThrowError(NotFoundError);
    });

    it('throws forbidden error for reviewers', async () => {
      await expect(
        EventSchedule.for(reviewer.id, team.slug, event.slug).addSession({
          trackId: 'track',
          start: new Date(schedule.start),
          end: new Date(schedule.end),
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      await expect(
        EventSchedule.for(owner.id, team.slug, meetup.slug).addSession({
          trackId: 'track',
          start: new Date(schedule.start),
          end: new Date(schedule.end),
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#updateSession', () => {
    it('updates a session with a proposal to a schedule', async () => {
      const eventSchedule = EventSchedule.for(owner.id, team.slug, event.slug);
      const track1 = await eventSchedule.saveTrack({ name: 'Room' });
      const track2 = await eventSchedule.saveTrack({ name: 'Room 2' });
      const session = await eventSchedule.addSession({
        trackId: track1.id,
        start: new Date(schedule.start),
        end: new Date(schedule.start),
      });

      const talk = await talkFactory({ speakers: [owner] });
      const proposal = await proposalFactory({ event, talk });
      const actual = await eventSchedule.updateSession({
        id: session.id,
        trackId: track2.id,
        color: 'gray',
        start: new Date(schedule.end),
        end: new Date(schedule.end),
        proposalId: proposal.id,
      });

      expect(actual?.trackId).toBe(track2.id);
      expect(actual?.start).toEqual(schedule.end);
      expect(actual?.end).toEqual(schedule.end);
      expect(actual?.proposalId).toBe(proposal.id);
    });

    it('throws not found Error when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      await expect(
        EventSchedule.for(owner.id, team.slug, eventWithoutSchedule.slug).updateSession({
          id: 'id',
          trackId: 'track',
          color: 'gray',
          start: new Date(schedule.end),
          end: new Date(schedule.end),
          proposalId: 'proposal',
        }),
      ).rejects.toThrowError(NotFoundError);
    });

    it('throws forbidden error for reviewers', async () => {
      await expect(
        EventSchedule.for(reviewer.id, team.slug, event.slug).updateSession({
          id: 'id',
          trackId: 'track',
          color: 'gray',
          start: new Date(schedule.end),
          end: new Date(schedule.end),
          proposalId: 'proposal',
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      await expect(
        EventSchedule.for(owner.id, team.slug, meetup.slug).updateSession({
          id: 'id',
          trackId: 'track',
          color: 'gray',
          start: new Date(schedule.end),
          end: new Date(schedule.end),
          proposalId: 'proposal',
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#deleteSession', () => {
    it('deletes a session from a schedule', async () => {
      const eventSchedule = EventSchedule.for(owner.id, team.slug, event.slug);
      const track = await eventSchedule.saveTrack({ name: 'Room' });
      const session = await eventSchedule.addSession({
        trackId: track.id,
        start: new Date(schedule.start),
        end: new Date(schedule.start),
      });

      await eventSchedule.deleteSession(session.id);

      const actual = await eventSchedule.getSchedulesByDay(0);
      expect(actual?.sessions.length).toBe(0);
    });

    it('throws not found Error when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      await expect(
        EventSchedule.for(owner.id, team.slug, eventWithoutSchedule.slug).deleteSession('sessionId'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('throws forbidden error for reviewers', async () => {
      await expect(
        EventSchedule.for(reviewer.id, team.slug, event.slug).deleteSession('sessionId'),
      ).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      await expect(EventSchedule.for(owner.id, team.slug, meetup.slug).deleteSession('sessionId')).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });

  describe('#saveTracks', () => {
    it('adds a new track', async () => {
      const eventSchedule = EventSchedule.for(owner.id, team.slug, event.slug);
      await eventSchedule.saveTrack({ name: 'Room 1' });

      const actual = await eventSchedule.get();
      expect(actual?.tracks.length).toBe(1);
      expect(actual?.tracks[0].name).toBe('Room 1');
    });

    it('updates a schedule track', async () => {
      const eventSchedule = EventSchedule.for(owner.id, team.slug, event.slug);
      const track = await eventSchedule.saveTrack({ name: 'Room 1' });

      await eventSchedule.saveTrack({ id: track.id, name: 'Room 2' });

      const actual = await eventSchedule.get();
      expect(actual?.tracks.length).toBe(1);
      expect(actual?.tracks[0].name).toBe('Room 2');
    });

    it('throws not found Error when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      await expect(
        EventSchedule.for(owner.id, team.slug, eventWithoutSchedule.slug).saveTrack({ name: 'Room 1' }),
      ).rejects.toThrowError(NotFoundError);
    });

    it('throws forbidden error for reviewers', async () => {
      await expect(
        EventSchedule.for(reviewer.id, team.slug, event.slug).saveTrack({ name: 'Room 1' }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      await expect(
        EventSchedule.for(owner.id, team.slug, meetup.slug).saveTrack({ name: 'Room 1' }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#deleteTrack', () => {
    it('deletes a schedule track', async () => {
      const eventSchedule = EventSchedule.for(owner.id, team.slug, event.slug);
      const track1 = await eventSchedule.saveTrack({ name: 'Room 1' });
      const track2 = await eventSchedule.saveTrack({ name: 'Room 2' });

      await eventSchedule.deleteTrack(track1.id);

      const actual = await eventSchedule.get();
      expect(actual?.tracks.length).toBe(1);
      expect(actual?.tracks[0].name).toBe(track2.name);
    });

    it('throws a forbidden Error when trying to delete the last track', async () => {
      const eventSchedule = EventSchedule.for(owner.id, team.slug, event.slug);
      const track = await eventSchedule.saveTrack({ name: 'Room 1' });
      await expect(eventSchedule.deleteTrack(track.id)).rejects.toThrowError(ForbiddenError);
    });

    it('throws not found Error when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      await expect(
        EventSchedule.for(owner.id, team.slug, eventWithoutSchedule.slug).deleteTrack('x'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('throws forbidden error for reviewers', async () => {
      await expect(EventSchedule.for(reviewer.id, team.slug, event.slug).deleteTrack('x')).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      await expect(EventSchedule.for(owner.id, team.slug, meetup.slug).deleteTrack('x')).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });

  describe('#getSchedulesByDay', () => {
    it('get schedule data for a day', async () => {
      const eventSchedule = EventSchedule.for(owner.id, team.slug, event.slug);
      const track = await eventSchedule.saveTrack({ name: 'Room' });
      const session = await eventSchedule.addSession({
        trackId: track.id,
        start: new Date(schedule.start),
        end: new Date(schedule.start),
      });
      const talk = await talkFactory({ speakers: [owner] });
      const proposal = await proposalFactory({ event, talk });
      await eventSchedule.updateSession({
        id: session.id,
        trackId: track.id,
        color: 'gray',
        start: new Date(schedule.start),
        end: new Date(schedule.start),
        proposalId: proposal.id,
      });

      const firstDay = await eventSchedule.getSchedulesByDay(0);
      expect(firstDay).toEqual({
        name: schedule.name,
        currentDay: schedule.start.toISOString(),
        timezone: 'Europe/Paris',
        displayEndMinutes: 1080,
        displayStartMinutes: 540,
        nextDayIndex: 1,
        previousDayIndex: null,
        tracks: [{ id: track.id, name: track.name }],
        sessions: [
          {
            id: session.id,
            trackId: session.trackId,
            start: session.start.toISOString(),
            end: session.end.toISOString(),
            name: null,
            color: 'gray',
            proposal: {
              id: proposal.id,
              title: proposal.title,
              confirmationStatus: proposal.confirmationStatus,
              deliberationStatus: proposal.deliberationStatus,
              languages: proposal.languages,
              categories: [],
              formats: [],
              speakers: [
                {
                  id: owner.id,
                  name: owner.name,
                  picture: owner.picture,
                  bio: owner.bio,
                  company: owner.company,
                },
              ],
            },
          },
        ],
      });

      const nextDay = await eventSchedule.getSchedulesByDay(1);
      expect(nextDay?.currentDay).toEqual(schedule.end.toISOString());
      expect(nextDay?.nextDayIndex).toBe(null);
      expect(nextDay?.previousDayIndex).toBe(0);
    });

    it('returns null when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      const result = await EventSchedule.for(owner.id, team.slug, eventWithoutSchedule.slug).getSchedulesByDay(0);
      expect(result).toBe(null);
    });

    it('throws an error for an unknown day', async () => {
      await expect(EventSchedule.for(owner.id, team.slug, event.slug).getSchedulesByDay(3)).rejects.toThrowError(
        NotFoundError,
      );
    });

    it('throws forbidden error for reviewers', async () => {
      await expect(EventSchedule.for(reviewer.id, team.slug, event.slug).getSchedulesByDay(0)).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      await expect(EventSchedule.for(owner.id, team.slug, meetup.slug).getSchedulesByDay(0)).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });
});
