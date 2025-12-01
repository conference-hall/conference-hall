import {
  getGMTOffset,
  getTimezonesList,
  getUserTimezone,
  parseToUtcEndOfDay,
  parseToUtcStartOfDay,
  timezoneToUtc,
  utcToTimezone,
} from './timezone.ts';

describe('timezone', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-02-26T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('#utcToTimezone', () => {
    it('converts UTC date to specified timezone', async () => {
      const utcDate = new Date('2024-01-01T00:00:00.000Z');
      const nyDate = utcToTimezone(utcDate, 'America/New_York');

      // Get expected hour in New York (UTC-5 during winter)
      expect(nyDate.getHours()).toBe(19);
      expect(nyDate.getMinutes()).toBe(0);
      expect(nyDate.getFullYear()).toBe(2023);
      expect(nyDate.getMonth()).toBe(11); // December is 11
      expect(nyDate.getDate()).toBe(31);
    });

    it('converts UTC string to specified timezone', async () => {
      const utcString = '2024-01-01T00:00:00.000Z';
      const nyDate = utcToTimezone(utcString, 'America/New_York');

      expect(nyDate.getHours()).toBe(19);
      expect(nyDate.getMinutes()).toBe(0);
      expect(nyDate.getFullYear()).toBe(2023);
      expect(nyDate.getMonth()).toBe(11);
      expect(nyDate.getDate()).toBe(31);
    });
  });

  describe('#timezoneToUtc', () => {
    it('converts timezone date to UTC', async () => {
      const nyDate = new Date(2023, 11, 31, 19, 0, 0);
      const utcDate = timezoneToUtc(nyDate, 'America/New_York');

      expect(utcDate.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('converts timezone string to UTC', async () => {
      const nyString = '2023-12-31T19:00:00.000';
      const utcDate = timezoneToUtc(nyString, 'America/New_York');

      expect(utcDate.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('#getUserTimezone', () => {
    it('returns the user timezone from Intl API', async () => {
      const originalDateTimeFormat = Intl.DateTimeFormat;
      const mockResolvedOptions = vi.fn().mockReturnValue({ timeZone: 'America/New_York' });
      const mockDateTimeFormat = vi.fn().mockReturnValue({
        resolvedOptions: mockResolvedOptions,
      });

      // @ts-expect-error - mocking global
      global.Intl.DateTimeFormat = mockDateTimeFormat;

      expect(getUserTimezone()).toBe('America/New_York');

      // Restore the original function
      global.Intl.DateTimeFormat = originalDateTimeFormat;
    });
  });

  describe('#getTimezonesList', () => {
    it('returns the formatted list of timezones with en-US locale', async () => {
      const timezones = getTimezonesList('en-US');

      const london = timezones.find((t) => t.value === 'Europe/London');
      expect(london).toEqual({
        value: 'Europe/London',
        name: '(GMT+00:00) United Kingdom Time - Europe/London',
      });
    });

    it('returns the formatted list of timezones with other locale', async () => {
      const timezones = getTimezonesList('fr');

      const london = timezones.find((t) => t.value === 'Europe/London');
      expect(london).toEqual({
        value: 'Europe/London',
        name: expect.stringContaining('Europe/London'),
      });
    });
  });

  describe('#getGMTOffset', () => {
    it('returns the formatted GMT offset of a timezone with en-US locale', async () => {
      const offsetNewYork = getGMTOffset('America/New_York', 'en-US');
      expect(offsetNewYork).toBe('EST');

      const offsetLondon = getGMTOffset('Europe/London', 'en-US');
      expect(offsetLondon).toBe('GMT');

      const offsetInvalid = getGMTOffset('Invalid/Timezone', 'en-US');
      expect(offsetInvalid).toBeNull();
    });

    it('returns the formatted GMT offset of a timezone with other locale', async () => {
      const offsetNewYork = getGMTOffset('America/New_York', 'fr');
      expect(offsetNewYork).toBe('UTC−5');

      const offsetLondon = getGMTOffset('Europe/London', 'fr');
      expect(offsetLondon).toBe('UTC');
    });
  });

  describe('#parseToUtcStartOfDay', () => {
    it('parses a string date from a timezone and convert it to start of the day and UTC', async () => {
      const utcStartOfDay = parseToUtcStartOfDay('2024-01-01', 'America/New_York');
      expect(utcStartOfDay.toISOString()).toBe('2024-01-01T05:00:00.000Z');
    });
  });

  describe('#parseToUtcEndOfDay', () => {
    it('parses a string date from a timezone and convert it to end of the day and UTC', async () => {
      const utcEndOfDay = parseToUtcEndOfDay('2024-01-01', 'America/New_York');
      expect(utcEndOfDay.toISOString()).toBe('2024-01-02T04:59:59.999Z');
    });
  });
});
