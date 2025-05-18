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
      // Expect format like "02/26/2020, 01:10"
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/);
    });

    it('formats date to medium datetime', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDatetime(date, { format: 'medium', locale: 'en' });
      // Format will be like "Feb 26, 2020, 1:10 AM"
      expect(formatted).toContain('Feb 26, 2020');
    });

    it('formats date to long datetime', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDatetime(date, { format: 'long', locale: 'en' });
      // Format will be like "Wednesday, February 26, 2020 at 1:10 AM GMT"
      expect(formatted).toContain('February 26, 2020');
    });

    it('respects timezone parameter', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDatetime(date, { format: 'short', locale: 'en', timezone: 'America/Los_Angeles' });
      // In Los Angeles, Feb 26, 01:10 UTC is Feb 25, 17:10
      expect(formatted).toContain('02/25/2020');
    });
  });

  describe('#formatDate', () => {
    it('formats date to short date', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDate(date, { format: 'short', locale: 'en' });
      // Expect format like "02/26/2020"
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('formats date to medium date', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDate(date, { format: 'medium', locale: 'en' });
      // Format will be like "Feb 26, 2020"
      expect(formatted).toContain('Feb 26, 2020');
    });

    it('formats date to long date', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDate(date, { format: 'long', locale: 'en' });
      // Format will contain "February 26, 2020"
      expect(formatted).toContain('February');
      expect(formatted).toContain('2020');
    });

    it('respects timezone parameter', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDate(date, { format: 'short', locale: 'en', timezone: 'America/Los_Angeles' });
      // In Los Angeles, Feb 26, 01:10 UTC is Feb 25
      expect(formatted).toContain('02/25/2020');
    });
  });

  describe('#formatDay', () => {
    it('formats date to short day', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDay(date, { format: 'short', locale: 'en' });
      // Expect format like "26"
      expect(formatted).toBe('26');
    });

    it('formats date to medium day', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDay(date, { format: 'medium', locale: 'en' });
      // Format will be like "26 Feb"
      expect(formatted).toContain('26');
      expect(formatted).toContain('Feb');
    });

    it('formats date to long day', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDay(date, { format: 'long', locale: 'en' });
      // Format will be like "26 February"
      expect(formatted).toContain('26');
      expect(formatted).toContain('February');
    });

    it('respects timezone parameter', async () => {
      const date = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatDay(date, { format: 'medium', locale: 'en', timezone: 'America/Los_Angeles' });
      // In Los Angeles, Feb 26, 01:10 UTC is Feb 25
      expect(formatted).toContain('25');
      expect(formatted).toContain('Feb');
    });
  });

  describe('#formatDateRange', () => {
    it('returns empty string for missing start date', async () => {
      // @ts-expect-error Testing with undefined start date
      const formatted = formatDateRange(undefined, new Date('2020-02-28T00:00:00.000Z'), 'en');
      expect(formatted).toBe('');
    });

    it('formats same start and end date', async () => {
      const date = new Date('2020-02-26T00:00:00.000Z');
      const formatted = formatDateRange(date, date, 'en');
      // Will format as a single date in long format
      expect(formatted).toContain('26');
      expect(formatted).toContain('February');
      expect(formatted).toContain('2020');
    });

    it('formats date range with different start and end dates', async () => {
      const startDate = new Date('2020-02-26T00:00:00.000Z');
      const endDate = new Date('2020-02-28T00:00:00.000Z');
      const formatted = formatDateRange(startDate, endDate, 'en');
      // Will format as a range like "26 Feb / 28 Feb 2020"
      expect(formatted).toContain('26');
      expect(formatted).toContain('28');
      expect(formatted).toContain('/');
    });

    it('handles different locales', async () => {
      const startDate = new Date('2020-02-26T00:00:00.000Z');
      const endDate = new Date('2020-02-28T00:00:00.000Z');
      const formatted = formatDateRange(startDate, endDate, 'fr');
      // French formatting should still have the date numbers
      expect(formatted).toContain('26');
      expect(formatted).toContain('28');
      expect(formatted).toContain('/');
      // Month names should be in French but testing exact strings can be brittle
    });

    it('formats dates from different months', async () => {
      const startDate = new Date('2020-02-26T00:00:00.000Z');
      const endDate = new Date('2020-03-05T00:00:00.000Z');
      const formatted = formatDateRange(startDate, endDate, 'en');
      // Should show both Feb and Mar
      expect(formatted).toContain('26');
      expect(formatted).toContain('5');
      expect(formatted).toMatch(/Feb|February/);
      expect(formatted).toMatch(/Mar|March/);
    });
  });

  describe('#formatTime', () => {
    it('format a date to a time HH:mm', async () => {
      const formatted = formatTime(new Date('2020-02-26T01:10:00.000Z'), { format: 'short', locale: 'en' });
      expect(formatted).toBe('01:10');
    });

    it('format a number in minutes to a time HH:mm', async () => {
      const formatted = formatTime(120, { format: 'short', locale: 'en' });
      expect(formatted).toBe('02:00');
    });

    it('formats time with medium format', async () => {
      const formatted = formatTime(new Date('2020-02-26T13:10:00.000Z'), { format: 'medium', locale: 'en' });
      // Format will have AM/PM indicator
      expect(formatted).toMatch(/1:10\s?PM/i);
    });

    it('formats time with long format including timezone', async () => {
      const formatted = formatTime(new Date('2020-02-26T13:10:00.000Z'), { format: 'long', locale: 'en' });
      // Format will have AM/PM indicator and timezone
      expect(formatted).toContain('PM');
      // Should contain timezone indicator (will vary by locale)
      expect(formatted).toMatch(/GMT|UTC/);
    });

    it('respects timezone parameter', async () => {
      const formatted = formatTime(new Date('2020-02-26T13:10:00.000Z'), {
        format: 'short',
        locale: 'en',
        timezone: 'America/Los_Angeles',
      });
      // In Los Angeles, 13:10 UTC is 05:10
      expect(formatted).toBe('05:10');
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
      expect(formatted).toBe('2020-02-26');
    });

    it('pads single digit month and day with leading zeros', async () => {
      const date = new Date('2020-05-05T01:10:00.000Z');
      const formatted = toDateInput(date);
      expect(formatted).toBe('2020-05-05');
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
      // 30 minutes ago
      const date = new Date('2020-02-26T11:30:00.000Z');
      const formatted = formatDistance(date, 'en');
      expect(formatted).toMatch(/30 minutes ago/);
    });

    it('formats hours', async () => {
      // 3 hours ago
      const date = new Date('2020-02-26T09:00:00.000Z');
      const formatted = formatDistance(date, 'en');
      expect(formatted).toMatch(/3 hours ago/);
    });

    it('formats days', async () => {
      // 3 days ago
      const date = new Date('2020-02-23T12:00:00.000Z');
      const formatted = formatDistance(date, 'en');
      expect(formatted).toMatch(/3 days ago/);
    });

    it('formats months', async () => {
      // 2 months ago
      const date = new Date('2019-12-26T12:00:00.000Z');
      const formatted = formatDistance(date, 'en');
      expect(formatted).toMatch(/2 months ago/);
    });

    it('formats years', async () => {
      // 2 years ago
      const date = new Date('2018-02-26T12:00:00.000Z');
      const formatted = formatDistance(date, 'en');
      expect(formatted).toMatch(/2 years ago/);
    });

    it('formats future times with "to" direction', async () => {
      // 30 minutes in the future
      const date = new Date('2020-02-26T12:30:00.000Z');
      const formatted = formatDistance(date, 'en', 'to');
      expect(formatted).toMatch(/in 30 minutes/);
    });
  });

  describe('#formatTimeDifference', () => {
    it('formats the difference between two dates', async () => {
      const date1 = new Date('2020-02-26T01:10:00.000Z');
      const date2 = new Date('2020-02-26T03:20:00.000Z');
      const formatted = formatTimeDifference(date1, date2);
      expect(formatted).toBe('2h 10m');
    });

    it('handles zero hours case', async () => {
      const date1 = new Date('2020-02-26T01:10:00.000Z');
      const date2 = new Date('2020-02-26T01:20:00.000Z');
      const formatted = formatTimeDifference(date1, date2);
      // Implementation omits "0h" and only shows "10m"
      expect(formatted).toBe('10m');
    });

    it('handles zero minutes case', async () => {
      const date1 = new Date('2020-02-26T01:00:00.000Z');
      const date2 = new Date('2020-02-26T03:00:00.000Z');
      const formatted = formatTimeDifference(date1, date2);
      // Implementation omits "0m" and only shows "2h"
      expect(formatted).toBe('2h');
    });

    it('works with dates in reverse order', async () => {
      const date1 = new Date('2020-02-26T03:20:00.000Z');
      const date2 = new Date('2020-02-26T01:10:00.000Z');
      const formatted = formatTimeDifference(date1, date2);
      // Note: date-fns intervalToDuration with reversed dates shows negative values
      expect(formatted).toBe('-2h -10m');
    });
  });

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

    it('handles single day (when start and end are the same)', async () => {
      const startDate = new Date('2020-02-26T00:00:00.000Z');
      const endDate = new Date('2020-02-26T00:00:00.000Z');
      const dates = getDatesRange(startDate, endDate);
      expect(dates).toHaveLength(1);
      expect(dates[0].toISOString()).toBe('2020-02-26T00:00:00.000Z');
    });

    it('handles dates spanning a month boundary', async () => {
      const startDate = new Date('2020-02-28T00:00:00.000Z');
      const endDate = new Date('2020-03-02T00:00:00.000Z');
      const dates = getDatesRange(startDate, endDate);
      expect(dates).toHaveLength(4);
      expect(dates[0].toISOString()).toBe('2020-02-28T00:00:00.000Z');
      expect(dates[1].toISOString()).toBe('2020-02-29T00:00:00.000Z'); // 2020 is a leap year
      expect(dates[2].toISOString()).toBe('2020-03-01T00:00:00.000Z');
      expect(dates[3].toISOString()).toBe('2020-03-02T00:00:00.000Z');
    });

    it('returns empty array if end date is before start date', async () => {
      const startDate = new Date('2020-02-28T00:00:00.000Z');
      const endDate = new Date('2020-02-26T00:00:00.000Z');
      const dates = getDatesRange(startDate, endDate);
      expect(dates).toHaveLength(0);
    });
  });
});
