import { ScheduleTime } from './schedule-time.ts';

const proposal = { id: 'proposal-1', routeId: '42', title: 'A talk', speakers: [{ name: 'Jane', picture: null }] };

describe('ScheduleTime', () => {
  const scheduleTime = new ScheduleTime('Europe/Paris');

  describe('#fromUtc', () => {
    it('reads the wall-clock time of the schedule timezone', () => {
      const date = scheduleTime.fromUtc(new Date('2024-10-05T07:00:00.000Z'));

      expect(date.getTime()).toBe(new Date('2024-10-05T07:00:00.000Z').getTime());
      expect(date.getHours()).toBe(9);
    });
  });

  describe('#toUtc', () => {
    it('reads a schedule time back as UTC', () => {
      const date = scheduleTime.toUtc(scheduleTime.fromUtc(new Date('2024-10-05T07:00:00.000Z')));

      expect(date.toISOString()).toBe('2024-10-05T07:00:00.000Z');
    });
  });

  describe('#session', () => {
    it('converts the start and end of a loaded session into schedule time', () => {
      const { timeslot, ...rest } = scheduleTime.session({
        id: 'session-1',
        trackId: 'track-1',
        start: new Date('2024-10-05T07:00:00.000Z'),
        end: new Date('2024-10-05T08:00:00.000Z'),
        name: null,
        language: null,
        color: 'gray',
        emojis: [],
        proposal,
      });

      expect(rest).toEqual({
        id: 'session-1',
        trackId: 'track-1',
        name: null,
        language: null,
        color: 'gray',
        emojis: [],
        proposal,
      });
      expect(timeslot.start.getTime()).toBe(new Date('2024-10-05T07:00:00.000Z').getTime());
      expect(timeslot.start.getHours()).toBe(9);
      expect(timeslot.end.getHours()).toBe(10);
    });
  });

  describe('#days', () => {
    it('returns one day at midnight in the schedule timezone across a daylight saving change', () => {
      const days = scheduleTime.days(new Date('2024-03-29T23:00:00.000Z'), new Date('2024-03-31T22:00:00.000Z'));

      expect(days.map((day) => day.toISOString())).toEqual([
        '2024-03-30T00:00:00.000+01:00',
        '2024-03-31T00:00:00.000+01:00',
        '2024-04-01T00:00:00.000+02:00',
      ]);
    });
  });

  describe('#dayIndex', () => {
    const newYorkTime = new ScheduleTime('America/New_York');
    const days = newYorkTime.days(new Date('2024-10-05T04:00:00.000Z'), new Date('2024-10-07T03:59:59.999Z'));

    it('returns the index of the first schedule day from a calendar date at midnight UTC', () => {
      expect(newYorkTime.dayIndex(days, new Date('2024-10-05T00:00:00.000Z'))).toBe(0);
    });

    it('returns the index of the last schedule day from a calendar date at midnight UTC', () => {
      expect(newYorkTime.dayIndex(days, new Date('2024-10-06T00:00:00.000Z'))).toBe(1);
    });

    it('returns null for a calendar date outside of the schedule', () => {
      expect(newYorkTime.dayIndex(days, new Date('2024-10-07T00:00:00.000Z'))).toBeNull();
    });
  });

  describe('#formatTime', () => {
    it('formats a time in the schedule timezone', () => {
      const time = scheduleTime.formatTime(new Date('2024-10-05T07:00:00.000Z'), 'en');

      expect(time).toBe('09:00');
    });
  });

  describe('#formatDate', () => {
    it('formats a date in the schedule timezone', () => {
      const date = scheduleTime.formatDate(new Date('2021-12-31T23:00:00.000Z'), 'en');

      expect(date).toBe('January 1, 2022');
    });
  });

  describe('#formatDateRange', () => {
    it('formats a date range in the schedule timezone', () => {
      const range = scheduleTime.formatDateRange(
        new Date('2021-12-31T23:00:00.000Z'),
        new Date('2022-01-01T23:00:00.000Z'),
        'en',
      );

      expect(range).toBe('Jan 1 / Jan 2, 2022');
    });

    it('formats a single day as a long date', () => {
      const range = scheduleTime.formatDateRange(
        new Date('2021-12-31T23:00:00.000Z'),
        new Date('2021-12-31T23:00:00.000Z'),
        'en',
      );

      expect(range).toBe('January 1, 2022');
    });
  });

  describe('#gmtOffset', () => {
    it('returns the winter offset of a winter day', () => {
      expect(scheduleTime.gmtOffset(new Date('2024-01-15T12:00:00.000Z'), 'en')).toBe('GMT+1');
    });

    it('returns the summer offset of a summer day', () => {
      expect(scheduleTime.gmtOffset(new Date('2024-07-15T12:00:00.000Z'), 'en')).toBe('GMT+2');
    });
  });
});
