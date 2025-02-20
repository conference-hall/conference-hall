import { getMinutesFromStartOfDay, setMinutesFromStartOfDay, toTimeFormat } from './datetimes.ts';

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
});
