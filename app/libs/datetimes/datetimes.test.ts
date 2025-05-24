import {
  formatDate,
  formatDateRange,
  formatDatetime,
  formatDay,
  formatDistance,
  formatTime,
  formatTimeDifference,
  getDatesRange,
  getMinutesFromStartOfDay,
  setMinutesFromStartOfDay,
  toDateInput,
} from './datetimes.ts';

describe('datetimes', () => {
  describe('#formatDatetime', () => {
    it('formats date to short datetime', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDatetime(date, { format: 'short', locale: 'en' });
      expect(formatted).toEqual('02/26/2020, 01:10');
    });

    it('formats date to medium datetime', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDatetime(date, { format: 'medium', locale: 'en' });
      expect(formatted).toEqual('Feb 26, 2020, 1:10 AM');
    });

    it('formats date to long datetime', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDatetime(date, { format: 'long', locale: 'en' });
      expect(formatted).toEqual('Wednesday, February 26, 2020 at 1:10 AM UTC');
    });

    it('respects timezone parameter', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDatetime(date, { format: 'short', locale: 'en', timezone: 'America/Los_Angeles' });
      // In Los Angeles, Feb 26, 01:10 UTC is Feb 25, 17:10
      expect(formatted).toEqual('02/25/2020, 17:10');
    });
  });

  describe('#formatDate', () => {
    it('formats date to short date', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDate(date, { format: 'short', locale: 'en' });
      expect(formatted).toEqual('02/26/2020');
    });

    it('formats date to medium date', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDate(date, { format: 'medium', locale: 'en' });
      expect(formatted).toEqual('Feb 26, 2020');
    });

    it('formats date to long date', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDate(date, { format: 'long', locale: 'en' });
      expect(formatted).toEqual('February 26, 2020 at UTC');
    });

    it('respects timezone parameter', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDate(date, { format: 'short', locale: 'en', timezone: 'America/Los_Angeles' });
      // In Los Angeles, Feb 26, 01:10 UTC is Feb 25
      expect(formatted).toEqual('02/25/2020');
    });
  });

  describe('#formatDay', () => {
    it('formats date to short day', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDay(date, { format: 'short', locale: 'en' });
      expect(formatted).toEqual('26');
    });

    it('formats date to medium day', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDay(date, { format: 'medium', locale: 'en' });
      expect(formatted).toEqual('Feb 26');
    });

    it('formats date to long day', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDay(date, { format: 'long', locale: 'en' });
      expect(formatted).toEqual('February 26');
    });

    it('respects timezone parameter', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDay(date, { format: 'medium', locale: 'en', timezone: 'America/Los_Angeles' });
      // In Los Angeles, Feb 26, 01:10 UTC is Feb 25
      expect(formatted).toEqual('Feb 25');
    });
  });

  describe('#formatDateRange', () => {
    it('formats same start and end date', async () => {
      const date = new Date('2020-02-26T00:00:00.000Z');
      const formatted = formatDateRange(date, date, 'en');
      expect(formatted).toEqual('February 26, 2020 at UTC');
    });

    it('formats date range with different start and end dates', async () => {
      const startDate = new Date('2020-02-26T00:00:00.000Z');
      const endDate = new Date('2020-02-28T00:00:00.000Z');
      const formatted = formatDateRange(startDate, endDate, 'en');
      expect(formatted).toEqual('Feb 26 / Feb 28, 2020');
    });

    it('handles different locales', async () => {
      const startDate = new Date('2020-02-26T00:00:00.000Z');
      const endDate = new Date('2020-02-28T00:00:00.000Z');
      const formatted = formatDateRange(startDate, endDate, 'fr');
      expect(formatted).toEqual('26 févr. / 28 févr. 2020');
    });

    it('formats dates from different months', async () => {
      const startDate = new Date('2020-02-26T00:00:00.000Z');
      const endDate = new Date('2020-03-05T00:00:00.000Z');
      const formatted = formatDateRange(startDate, endDate, 'en');
      expect(formatted).toEqual('Feb 26 / Mar 5, 2020');
    });
  });

  describe('#formatTime', () => {
    it('format a date to a time HH:mm', async () => {
      const formatted = formatTime(new Date('2020-02-26T01:10:00.000Z'), { format: 'short', locale: 'en' });
      expect(formatted).toEqual('01:10');
    });

    it('format a number in minutes to a time HH:mm', async () => {
      const formatted = formatTime(120, { format: 'short', locale: 'en' });
      expect(formatted).toEqual('02:00');
    });

    it('formats time with medium format', async () => {
      const formatted = formatTime(new Date('2020-02-26T13:10:00.000Z'), { format: 'medium', locale: 'en' });
      expect(formatted).toEqual('1:10 PM');
    });

    it('formats time with long format including timezone', async () => {
      const formatted = formatTime(new Date('2020-02-26T13:10:00.000Z'), { format: 'long', locale: 'en' });
      expect(formatted).toEqual('1:10 PM UTC');
    });

    it('respects timezone parameter', async () => {
      const formatted = formatTime(new Date('2020-02-26T13:10:00.000Z'), {
        format: 'short',
        locale: 'en',
        timezone: 'America/Los_Angeles',
      });
      // In Los Angeles, 13:10 UTC is 05:10
      expect(formatted).toEqual('05:10');
    });
  });

  describe('#toDateInput', () => {
    it('returns null for null or undefined date', async () => {
      expect(toDateInput(null)).toBeNull();
      expect(toDateInput(undefined)).toBeNull();
    });

    it('formats date to YYYY-MM-DD for input field', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = toDateInput(date);
      expect(formatted).toEqual('2020-02-26');
    });

    it('pads single digit month and day with leading zeros', async () => {
      const date = new Date('2020-05-05T01:10:00.000Z');
      const formatted = toDateInput(date);
      expect(formatted).toEqual('2020-05-05');
    });
  });

  describe('#formatDistance', () => {
    beforeEach(async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2020-02-26T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('formats minutes within an hour', async () => {
      const date = new Date('2020-02-26T11:30:00.000Z');
      const formatted = formatDistance(date, 'en');
      expect(formatted).toEqual('30 minutes ago');
    });

    it('formats hours', async () => {
      const date = new Date('2020-02-26T09:00:00.000Z');
      const formatted = formatDistance(date, 'en');
      expect(formatted).toEqual('3 hours ago');
    });

    it('formats days', async () => {
      const date = new Date('2020-02-23T12:00:00.000Z');
      const formatted = formatDistance(date, 'en');
      expect(formatted).toEqual('3 days ago');
    });

    it('formats months', async () => {
      const date = new Date('2019-12-26T12:00:00.000Z');
      const formatted = formatDistance(date, 'en');
      expect(formatted).toEqual('2 months ago');
    });

    it('formats years', async () => {
      const date = new Date('2018-02-26T12:00:00.000Z');
      const formatted = formatDistance(date, 'en');
      expect(formatted).toEqual('2 years ago');
    });

    it('formats future times with "to" direction', async () => {
      const date = new Date('2020-02-26T12:30:00.000Z');
      const formatted = formatDistance(date, 'en', 'to');
      expect(formatted).toEqual('in 30 minutes');
    });
  });

  describe('#formatTimeDifference', () => {
    it('formats the difference between two dates', async () => {
      const date1 = new Date('2020-02-26T01:10:00.000Z');
      const date2 = new Date('2020-02-26T03:20:00.000Z');
      const formatted = formatTimeDifference(date1, date2);
      expect(formatted).toEqual('2h 10m');
    });

    it('handles zero hours case', async () => {
      const date1 = new Date('2020-02-26T01:10:00.000Z');
      const date2 = new Date('2020-02-26T01:20:00.000Z');
      const formatted = formatTimeDifference(date1, date2);
      expect(formatted).toEqual('10m');
    });

    it('handles zero minutes case', async () => {
      const date1 = new Date('2020-02-26T01:00:00.000Z');
      const date2 = new Date('2020-02-26T03:00:00.000Z');
      const formatted = formatTimeDifference(date1, date2);
      expect(formatted).toEqual('2h');
    });

    it('works with dates in reverse order', async () => {
      const date1 = new Date('2020-02-26T03:20:00.000Z');
      const date2 = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatTimeDifference(date1, date2);
      expect(formatted).toEqual('-2h -10m');
    });
  });

  describe('#getMinutesFromStartOfDay', () => {
    it('returns total of minutes from the start of a day', async () => {
      const minutes = getMinutesFromStartOfDay(new Date('2020-02-26T01:10:00.000Z'));
      expect(minutes).toEqual(70);
    });
  });

  describe('#setMinutesFromStartOfDay', () => {
    it('add minutes to the start of a day', async () => {
      const date = setMinutesFromStartOfDay(new Date('2020-02-26T01:10:00.000Z'), 30);
      expect(date.toISOString()).toEqual('2020-02-26T00:30:00.000Z');
    });
  });

  describe('#getDatesRange', () => {
    it('returns an array of dates between two dates', async () => {
      const startDate = new Date('2020-02-26T00:00:00.000Z');
      const endDate = new Date('2020-02-28T00:00:00.000Z');
      const dates = getDatesRange(startDate, endDate);
      expect(dates).toHaveLength(3);
      expect(dates[0].toISOString()).toEqual('2020-02-26T00:00:00.000Z');
      expect(dates[1].toISOString()).toEqual('2020-02-27T00:00:00.000Z');
      expect(dates[2].toISOString()).toEqual('2020-02-28T00:00:00.000Z');
    });

    it('handles single day (when start and end are the same)', async () => {
      const startDate = new Date('2020-02-26T00:00:00.000Z');
      const endDate = new Date('2020-02-26T00:00:00.000Z');
      const dates = getDatesRange(startDate, endDate);
      expect(dates).toHaveLength(1);
      expect(dates[0].toISOString()).toEqual('2020-02-26T00:00:00.000Z');
    });

    it('handles dates spanning a month boundary', async () => {
      const startDate = new Date('2020-02-28T00:00:00.000Z');
      const endDate = new Date('2020-03-02T00:00:00.000Z');
      const dates = getDatesRange(startDate, endDate);
      expect(dates).toHaveLength(4);
      expect(dates[0].toISOString()).toEqual('2020-02-28T00:00:00.000Z');
      expect(dates[1].toISOString()).toEqual('2020-02-29T00:00:00.000Z'); // 2020 is a leap year
      expect(dates[2].toISOString()).toEqual('2020-03-01T00:00:00.000Z');
      expect(dates[3].toISOString()).toEqual('2020-03-02T00:00:00.000Z');
    });

    it('returns empty array if end date is before start date', async () => {
      const startDate = new Date('2020-02-28T00:00:00.000Z');
      const endDate = new Date('2020-02-26T00:00:00.000Z');
      const dates = getDatesRange(startDate, endDate);
      expect(dates).toHaveLength(0);
    });
  });
});
