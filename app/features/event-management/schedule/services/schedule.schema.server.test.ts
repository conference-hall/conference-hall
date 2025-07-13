import { z } from 'zod/v4';
import { ScheduleCreateSchema, ScheduleDisplayTimesUpdateSchema } from './schedule.schema.server.ts';

describe('EventSchedule types', () => {
  describe('#ScheduleCreateSchema', () => {
    it('validates ScheduleCreateSchema inputs and transform dates with TZ', async () => {
      const result = ScheduleCreateSchema.safeParse({
        name: 'Devfest',
        timezone: 'Europe/Paris',
        start: '2024-01-01',
        end: '2024-01-02',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        name: 'Devfest',
        timezone: 'Europe/Paris',
        start: new Date('2023-12-31T23:00:00.000Z'),
        end: new Date('2024-01-02T22:59:59.999Z'),
      });
    });

    it('returns errors when mandatory fields are missing', async () => {
      const result = ScheduleCreateSchema.safeParse({});

      expect(result.success).toBe(false);
      expect(z.flattenError(result.error!).fieldErrors).toEqual({
        name: ['Invalid input: expected string, received undefined'],
        timezone: ['Invalid input: expected string, received undefined'],
        start: ['Invalid input: expected string, received undefined'],
        end: ['Invalid input: expected string, received undefined'],
      });
    });

    it('returns "name" errors', async () => {
      const result = ScheduleCreateSchema.safeParse({
        name: '',
        timezone: 'Europe/Paris',
        start: '2024-01-02',
        end: '2024-01-03',
      });

      expect(result.success).toBe(false);
      expect(z.flattenError(result.error!).fieldErrors).toEqual({
        name: ['Too small: expected string to have >=1 characters'],
      });
    });

    it('returns "dates" errors', async () => {
      const result = ScheduleCreateSchema.safeParse({
        name: 'Hello World',
        timezone: 'Europe/Paris',
        start: '2024-01-03',
        end: '2024-01-02',
      });

      expect(result.success).toBe(false);
      expect(z.flattenError(result.error!).fieldErrors).toEqual({
        start: ['Schedule start date must be before the end date.'],
      });
    });
  });

  describe('#ScheduleDisplayTimesUpdateSchema', () => {
    it('validates ScheduleDisplayTimesUpdateSchema inputs', async () => {
      const result = ScheduleDisplayTimesUpdateSchema.safeParse({
        displayStartMinutes: 10,
        displayEndMinutes: 20,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        displayStartMinutes: 10,
        displayEndMinutes: 20,
      });
    });

    it('returns errors when times input are not numbers', async () => {
      const result = ScheduleDisplayTimesUpdateSchema.safeParse({});

      expect(result.success).toBe(false);
      expect(z.flattenError(result.error!).fieldErrors).toEqual({
        displayStartMinutes: ['Invalid input: expected number, received NaN'],
        displayEndMinutes: ['Invalid input: expected number, received NaN'],
      });
    });

    it('returns error when displayStartMinutes after displayEndMinutes', async () => {
      const result = ScheduleDisplayTimesUpdateSchema.safeParse({
        displayStartMinutes: 20,
        displayEndMinutes: 10,
      });

      expect(result.success).toBe(false);
      expect(z.flattenError(result.error!).fieldErrors).toEqual({
        displayStartMinutes: ['Displayed start in minutes must be before end in minutes.'],
      });
    });
  });
});
