import {
  formatTimeDifference,
  getDatesRange,
  getMinutesFromStartOfDay,
  setMinutesFromStartOfDay,
  toTimeFormat,
} from './datetimes.ts';

describe('datetimes', () => {
  describe('#getMinutesFromStartOfDay', () => {
    it('returns total of minutes from the start of a day', async () => {
      const minutes = getMinutesFromStartOfDay(new Date('2020-02-26T01:10:00.000Z'));
      expect(minutes).toBe(70);
    });
  });

  describe('#setMinutesFromStartOfDay', () => {
    it('add minutes to the start of a day', async () => {
      const date = setMinutesFromStartOfDay(new Date('2020-02-26T01:10:00.000Z'), 30);
      expect(date.toISOString()).toBe('2020-02-26T00:30:00.000Z');
    });
  });

  describe('#toTimeFormat', () => {
    it('format a date to a time HH:mm', async () => {
      const formatted = toTimeFormat(new Date('2020-02-26T01:10:00.000Z'));
      expect(formatted).toBe('01:10');
    });

    it('format a number in minutes to a time HH:mm', async () => {
      const formatted = toTimeFormat(120);
      expect(formatted).toBe('02:00');
    });
  });

  describe('#formatTimeDifference', () => {
    it('formats the difference between two dates', async () => {
      const date1 = new Date('2020-02-26T01:10:00.000Z');
      const date2 = new Date('2020-02-26T03:20:00.000Z');
      const formatted = formatTimeDifference(date1, date2);
      expect(formatted).toBe('2h 10m');
    });
  });

  describe('#getDatesRange', () => {
    it('returns an array of dates between two dates', async () => {
      const startDate = new Date('2020-02-26T00:00:00.000Z');
      const endDate = new Date('2020-02-28T00:00:00.000Z');
      const dates = getDatesRange(startDate, endDate);
      expect(dates).toHaveLength(3);
      expect(dates[0].toISOString()).toBe('2020-02-26T00:00:00.000Z');
      expect(dates[1].toISOString()).toBe('2020-02-27T00:00:00.000Z');
      expect(dates[2].toISOString()).toBe('2020-02-28T00:00:00.000Z');
    });
  });
});
