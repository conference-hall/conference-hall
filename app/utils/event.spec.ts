import { vi } from 'vitest';

import {
  formatCFPDate,
  formatCFPElapsedTime,
  formatCFPState,
  formatConferenceDates,
  formatEventType,
  getCfpState,
} from './event';

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

describe('#formatConferenceDates', () => {
  it('return conference type when no dates', () => {
    const message = formatConferenceDates('CONFERENCE');
    expect(message).toBe('Conference');
  });

  it('return one day conference info', () => {
    const message = formatConferenceDates('CONFERENCE', '2020-10-05T00:00:00.000Z', '2020-10-05T00:00:00.000Z');
    expect(message).toBe('October 5th, 2020');
  });

  it('return several days conference info', () => {
    const message = formatConferenceDates('CONFERENCE', '2020-10-05T00:00:00.000Z', '2020-10-07T00:00:00.000Z');
    expect(message).toBe('October 5th to October 7th, 2020');
  });
});

describe('#formatCFPState', () => {
  it('return closed cfp message', () => {
    const message = formatCFPState('CLOSED');
    expect(message).toBe('Call for paper not open yet');
  });

  it('return opened cfp message', () => {
    const message = formatCFPState('OPENED');
    expect(message).toBe('Call for paper open');
  });

  it('return finished cfp message', () => {
    const message = formatCFPState('FINISHED');
    expect(message).toBe('Call for paper closed');
  });
});

describe('#formatCFPElapsedTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('return "CFP not open" if no dates', () => {
    const message = formatCFPElapsedTime('CLOSED');
    expect(message).toBe('Call for paper not open yet');
  });

  it('returns closed CFP', () => {
    vi.setSystemTime(new Date('2020-02-26T00:00:00.000Z'));
    const start = '2020-02-27T00:00:00.000Z';
    const end = '2020-02-28T23:59:59.000Z';
    const message = formatCFPElapsedTime('CLOSED', start, end);
    expect(message).toBe('Call for paper open in 1 day');
  });

  it('returns opened CFP', () => {
    vi.setSystemTime(new Date('2020-02-27T12:00:00.000Z'));
    const start = '2020-02-27T00:00:00.000Z';
    const end = '2020-02-28T23:59:59.000Z';
    const message = formatCFPElapsedTime('OPENED', start, end);
    expect(message).toBe('Call for paper open for 1 day');
  });

  it('returns finished CFP', () => {
    vi.setSystemTime(new Date('2020-02-30T00:00:00.000Z'));
    const start = '2020-02-27T00:00:00.000Z';
    const end = '2020-02-28T23:59:59.000Z';
    const message = formatCFPElapsedTime('FINISHED', start, end);
    expect(message).toBe('Call for paper closed since 1 day');
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
    expect(message).toBe('Open on Monday, October 5th, 2020 at 12:00 AM');
  });

  it('return several days for opened conference info', () => {
    const message = formatCFPDate('OPENED', '2020-10-05T00:00:00.000Z', '2020-10-07T00:00:00.000Z');
    expect(message).toBe('Open until Wednesday, October 7th, 2020 at 12:00 AM');
  });

  it('return several days for finished conference info', () => {
    const message = formatCFPDate('FINISHED', '2020-10-05T00:00:00.000Z', '2020-10-07T00:00:00.000Z');
    expect(message).toBe('Closed since Wednesday, October 7th, 2020');
  });
});

describe('#getCfpState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('For CONFERENCE', () => {
    it('is CLOSED if no cfp start or end are defined', () => {
      vi.setSystemTime(new Date('2020-02-27T13:00:00.000Z'));
      const state = getCfpState('CONFERENCE', null, null);

      expect(state).toBe('CLOSED');
    });

    it('is CLOSED if today is before cfp start', () => {
      vi.setSystemTime(new Date('2020-02-26T23:59:58.000Z'));
      const start = new Date('2020-02-27T00:00:00.000Z');
      const end = new Date('2020-02-27T23:59:59.000Z');

      const state = getCfpState('CONFERENCE', start, end);

      expect(state).toBe('CLOSED');
    });

    it('is OPENED if today between cfp start and end', () => {
      vi.setSystemTime(new Date('2020-02-27T23:59:58.000Z'));
      const start = new Date('2020-02-27T00:00:00.000Z');
      const end = new Date('2020-02-27T23:59:59.000Z');

      const state = getCfpState('CONFERENCE', start, end);

      expect(state).toBe('OPENED');
    });

    it('is FINISHED if today is after cfp end', () => {
      vi.setSystemTime(new Date('2020-02-28T00:00:00.000Z'));
      const start = new Date('2020-02-27T00:00:00.000Z');
      const end = new Date('2020-02-27T23:59:59.000Z');

      const state = getCfpState('CONFERENCE', start, end);

      expect(state).toBe('FINISHED');
    });
  });

  describe('For MEETUP', () => {
    it('is CLOSED if no cfp start or end are defined', () => {
      vi.setSystemTime(new Date('2020-02-27T13:00:00.000Z'));
      const state = getCfpState('MEETUP', null, null);

      expect(state).toBe('CLOSED');
    });

    it('is CLOSED if today is before cfp start', () => {
      vi.setSystemTime(new Date('2020-02-26T23:59:58.000Z'));
      const start = new Date('2020-02-27T00:00:00.000Z');

      const state = getCfpState('MEETUP', start);

      expect(state).toBe('CLOSED');
    });

    it('is OPENED if today between cfp start and end', () => {
      vi.setSystemTime(new Date('2020-02-27T23:59:58.000Z'));
      const start = new Date('2020-02-27T00:00:00.000Z');

      const state = getCfpState('MEETUP', start);

      expect(state).toBe('OPENED');
    });
  });
});
