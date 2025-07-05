import type { Event, Schedule, Team, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { scheduleFactory } from 'tests/factories/schedule.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ApiKeyInvalidError, EventNotFoundError, ForbiddenOperationError } from '~/shared/errors.server.ts';
import { EventScheduleApi } from './schedule-api.server.ts';

describe('EventScheduleApi', () => {
  let owner: User;
  let reviewer: User;
  let team: Team;
  let event: Event;
  let schedule: Schedule;

  beforeEach(async () => {
    owner = await userFactory();
    reviewer = await userFactory();
    team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ team, traits: ['conference'], attributes: { apiKey: '123' } });
    schedule = await scheduleFactory({ event });
    await eventFactory({ team, traits: ['conference', 'withSchedule'] });
  });

  describe('#forJsonApi', () => {
    it('exports schedule as JSON via API', async () => {
      const json = await EventScheduleApi.forJsonApi(event.slug, '123');

      expect(json).toEqual({
        name: schedule.name,
        days: expect.any(Array),
        timeZone: schedule.timezone,
        sessions: expect.any(Array),
      });
    });

    it('throws EventNotFoundError for invalid event slug', async () => {
      await expect(EventScheduleApi.forJsonApi('invalid-slug', '123')).rejects.toThrowError(EventNotFoundError);
    });

    it('throws ApiKeyInvalidError for invalid API key', async () => {
      await expect(EventScheduleApi.forJsonApi(event.slug, 'invalid-api-key')).rejects.toThrowError(ApiKeyInvalidError);
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'], attributes: { apiKey: '123' } });
      await expect(EventScheduleApi.forJsonApi(meetup.slug, '123')).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
