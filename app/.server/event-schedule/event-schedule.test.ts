import type { Event, Schedule, Team, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { scheduleFactory } from 'tests/factories/schedule.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ForbiddenOperationError, NotFoundError } from '~/libs/errors.server.ts';

import { EventSchedule } from './event-schedule.ts';
import type { ScheduleSettingsData } from './event-schedule.types.ts';

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

  describe('#settings', () => {
    it('get schedule settings', async () => {
      const settings = await EventSchedule.for(owner.id, team.slug, event.slug).settings();

      expect(settings).toEqual({
        name: schedule.name,
        startTimeslot: schedule.startTimeslot,
        endTimeslot: schedule.endTimeslot,
        intervalMinutes: schedule.intervalMinutes,
      });
    });

    it('returns null when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      const settings = await EventSchedule.for(owner.id, team.slug, eventWithoutSchedule.slug).settings();
      expect(settings).toBe(null);
    });

    it('throws forbidden error for reviewers', async () => {
      await expect(EventSchedule.for(reviewer.id, team.slug, event.slug).settings()).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      await expect(EventSchedule.for(owner.id, team.slug, meetup.slug).settings()).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });

  describe('#saveSettings', () => {
    const scheduleSettings: ScheduleSettingsData = {
      name: 'New schedule name',
      startTimeslot: '10:00',
      endTimeslot: '12:00',
      intervalMinutes: 15,
    };

    it('save schedule settings', async () => {
      const settings = EventSchedule.for(owner.id, team.slug, event.slug);
      await settings.saveSettings(scheduleSettings);

      const actual = await settings.settings();
      expect(actual).toEqual(scheduleSettings);
    });

    it('throws not found Error when no schedule defined for the event', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      await expect(
        EventSchedule.for(owner.id, team.slug, eventWithoutSchedule.slug).saveSettings(scheduleSettings),
      ).rejects.toThrowError(NotFoundError);
    });

    it('throws forbidden error for reviewers', async () => {
      await expect(EventSchedule.for(reviewer.id, team.slug, event.slug).settings()).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      await expect(EventSchedule.for(owner.id, team.slug, meetup.slug).settings()).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });
});
