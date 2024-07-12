import {
  formatZonedTimeToUtc,
  getGMTOffset,
  getTimezonesList,
  parseToUtcEndOfDay,
  parseToUtcStartOfDay,
} from './timezone.ts';

describe('timezone', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-02-26T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('#getTimezonesList', () => {
    it('returns the formatted list of timezones', async () => {
      const timezones = getTimezonesList();

      const london = timezones.find((t) => t.id === 'Europe/London');
      expect(london).toEqual({
        id: 'Europe/London',
        name: '(GMT+00:00) United Kingdom Time - Europe/London',
      });
    });
  });

  describe('#getGMTOffset', () => {
    it('returns the formatted GMT offset of a timezone', async () => {
      const offsetParis = getGMTOffset('Europe/Paris');
      expect(offsetParis).toBe('GMT+1');

      const offsetLondon = getGMTOffset('Europe/London');
      expect(offsetLondon).toBe('GMT');
    });
  });

  describe('#parseToUtcStartOfDay', () => {
    it('parses a string date from a timezone and convert it to start of the day and UTC', async () => {
      const utcStartOfDay = parseToUtcStartOfDay('2024-01-01', 'Europe/Paris');
      expect(utcStartOfDay.toISOString()).toBe('2023-12-31T23:00:00.000Z');
    });
  });

  describe('#parseToUtcEndOfDay', () => {
    it('parses a string date from a timezone and convert it to end of the day and UTC', async () => {
      const utcEndOfDay = parseToUtcEndOfDay('2024-01-01', 'Europe/Paris');
      expect(utcEndOfDay.toISOString()).toBe('2024-01-01T22:59:59.999Z');
    });
  });

  describe('#formatZonedTimeToUtc', () => {
    it('converts a timezoned date to UTC and format it to ISO format', async () => {
      const utc = formatZonedTimeToUtc(new Date('2024-01-01T00:00:00.000Z'), 'Europe/Paris');
      expect(utc).toBe('2023-12-31T23:00:00.000Z');
    });
  });
});
