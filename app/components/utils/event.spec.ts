import { formatCFPDate, formatCFPState, formatConferenceDates, formatEventType } from './event';

describe('Event utilities', () => {
  describe('#formatEventType', () => {
    it('return conference label', () => {
      const message = formatEventType('CONFERENCE');
      expect(message).toBe('Conference');
    });

    it('return meetup label', () => {
      const message = formatEventType('MEETUP');
      expect(message).toBe('Meetup');
    });
  });

  describe('#formatEventDates', () => {
    it('return undefined when no dates', () => {
      const message = formatConferenceDates();
      expect(message).toBeUndefined();
    });

    it('return one day conference info', () => {
      const message = formatConferenceDates('2020-10-05T00:00:00.000Z', '2020-10-05T00:00:00.000Z');
      expect(message).toBe('1 day conference - October 5th, 2020');
    });

    it('return several days conference info', () => {
      const message = formatConferenceDates('2020-10-05T00:00:00.000Z', '2020-10-07T00:00:00.000Z');
      expect(message).toBe('3 days conference · October 5th — October 7th, 2020');
    });
  });

  describe('#formatCFPState', () => {
    it('return closed cfp message', () => {
      const message = formatCFPState('CLOSED');
      expect(message).toBe('Call for paper is closed');
    });

    it('return opened cfp message', () => {
      const message = formatCFPState('OPENED');
      expect(message).toBe('Call for paper is open');
    });

    it('return finished cfp message', () => {
      const message = formatCFPState('FINISHED');
      expect(message).toBe('Call for paper is finished');
    });
  });

  describe('#formatCFPDate', () => {
    it('return undefined if no dates', () => {
      const message = formatCFPDate('CLOSED');
      expect(message).toBeUndefined();
    });

    it('return undefined if only start date', () => {
      const message = formatCFPDate('CLOSED', '2020-10-05T00:00:00.000Z');
      expect(message).toBeUndefined();
    });

    it('return one day conference info', () => {
      const message = formatCFPDate('CLOSED', '2020-10-05T00:00:00.000Z', '2020-10-07T00:00:00.000Z');
      expect(message).toBe('Will open Monday, October 5th, 2020 at 2:00 AM GMT+2');
    });

    it('return several days conference info', () => {
      const message = formatCFPDate('OPENED', '2020-10-05T00:00:00.000Z', '2020-10-07T00:00:00.000Z');
      expect(message).toBe('Until Wednesday, October 7th, 2020 at 2:00 AM GMT+2');
    });

    it('return several days conference info', () => {
      const message = formatCFPDate('FINISHED', '2020-10-05T00:00:00.000Z', '2020-10-07T00:00:00.000Z');
      expect(message).toBe('Since Wednesday, October 7th, 2020');
    });
  });
})