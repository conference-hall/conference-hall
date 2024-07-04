import type { Event, Schedule, Team, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { scheduleFactory } from 'tests/factories/schedule.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ForbiddenError, ForbiddenOperationError, NotFoundError } from '~/libs/errors.server.ts';

import { EventSchedule } from './event-schedule.ts';
import type { ScheduleEditData } from './event-schedule.types.ts';

describe('EventSchedule', () => {
  let owner: User, reviewer: User;
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

      const settings = await eventSchedule.get();
      expect(settings).toEqual({
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
      const settings = await EventSchedule.for(owner.id, team.slug, eventWithoutSchedule.slug).get();
      expect(settings).toBe(null);
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

  describe('#saveSettings', () => {
    const scheduleSettings: ScheduleEditData = {
      name: 'New schedule name',
    };

    it('save schedule settings', async () => {
      const settings = EventSchedule.for(owner.id, team.slug, event.slug);
      await settings.saveSettings(scheduleSettings);

      const actual = await settings.get();
      expect(actual?.name).toEqual(scheduleSettings.name);
    });

    it('throws not found Error when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      await expect(
        EventSchedule.for(owner.id, team.slug, eventWithoutSchedule.slug).saveSettings(scheduleSettings),
      ).rejects.toThrowError(NotFoundError);
    });

    it('throws forbidden error for reviewers', async () => {
      await expect(
        EventSchedule.for(reviewer.id, team.slug, event.slug).saveSettings(scheduleSettings),
      ).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      await expect(
        EventSchedule.for(owner.id, team.slug, meetup.slug).saveSettings(scheduleSettings),
      ).rejects.toThrowError(ForbiddenOperationError);
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
});
