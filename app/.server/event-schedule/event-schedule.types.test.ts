import { ScheduleCreateSchema, ScheduleDisplayTimesUpdateSchema } from './event-schedule.types.ts';

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
      expect(result.error?.flatten().fieldErrors).toEqual({
        name: ['Required'],
        timezone: ['Required'],
        start: ['Required'],
        end: ['Required'],
      });
    });

    it('returns some specific errors', async () => {
      const result = ScheduleCreateSchema.safeParse({
        name: '',
        timezone: 'Europe/Paris',
        start: '2024-01-03',
        end: '2024-01-02',
      });

      expect(result.success).toBe(false);
      expect(result.error?.flatten().fieldErrors).toEqual({
        name: ['String must contain at least 1 character(s)'],
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
      expect(result.error?.flatten().fieldErrors).toEqual({
        displayStartMinutes: ['Expected number, received nan'],
        displayEndMinutes: ['Expected number, received nan'],
      });
    });

    it('returns error when displayStartMinutes after displayEndMinutes', async () => {
      const result = ScheduleDisplayTimesUpdateSchema.safeParse({
        displayStartMinutes: 20,
        displayEndMinutes: 10,
      });

      expect(result.success).toBe(false);
      expect(result.error?.flatten().fieldErrors).toEqual({
        displayStartMinutes: ['Displayed start in minutes must be before end in minutes.'],
      });
    });
  });
});
