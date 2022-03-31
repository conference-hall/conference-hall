import { formatCFPDate, formatCFPState, formatConferenceDates, formatEventType, getCfpState } from './event';

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
    expect(message).toBe('1 day conference - October 5th, 2020');
  });

  it('return several days conference info', () => {
    const message = formatConferenceDates('CONFERENCE', '2020-10-05T00:00:00.000Z', '2020-10-07T00:00:00.000Z');
    expect(message).toBe('3 days conference · October 5th — October 7th, 2020');
  });
});

describe('#formatCFPState', () => {
  it('return closed cfp message', () => {
    const message = formatCFPState('CLOSED');
    expect(message).toBe('Call for paper is not open yet');
  });

  it('return opened cfp message', () => {
    const message = formatCFPState('OPENED');
    expect(message).toBe('Call for paper is open');
  });

  it('return finished cfp message', () => {
    const message = formatCFPState('FINISHED');
    expect(message).toBe('Call for paper is closed');
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

describe('#getCfpState', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('For CONFERENCE', () => {
    it('is CLOSED if no cfp start or end are defined', () => {
      jest.setSystemTime(new Date('2020-02-27T13:00:00.000Z'));
      const state = getCfpState('CONFERENCE', null, null);

      expect(state).toBe('CLOSED');
    });

    it('is CLOSED if today is before cfp start', () => {
      jest.setSystemTime(new Date('2020-02-26T23:59:58.000Z'));
      const start = new Date('2020-02-27T00:00:00.000Z');
      const end = new Date('2020-02-27T23:59:59.000Z');

      const state = getCfpState('CONFERENCE', start, end);

      expect(state).toBe('CLOSED');
    });

    it('is OPENED if today between cfp start and end', () => {
      jest.setSystemTime(new Date('2020-02-27T23:59:58.000Z'));
      const start = new Date('2020-02-27T00:00:00.000Z');
      const end = new Date('2020-02-27T23:59:59.000Z');

      const state = getCfpState('CONFERENCE', start, end);

      expect(state).toBe('OPENED');
    });

    it('is FINISHED if today is after cfp end', () => {
      jest.setSystemTime(new Date('2020-02-28T00:00:00.000Z'));
      const start = new Date('2020-02-27T00:00:00.000Z');
      const end = new Date('2020-02-27T23:59:59.000Z');

      const state = getCfpState('CONFERENCE', start, end);

      expect(state).toBe('FINISHED');
    });
  });

  describe('For MEETUP', () => {
    it('is CLOSED if no cfp start or end are defined', () => {
      jest.setSystemTime(new Date('2020-02-27T13:00:00.000Z'));
      const state = getCfpState('MEETUP', null, null);

      expect(state).toBe('CLOSED');
    });

    it('is CLOSED if today is before cfp start', () => {
      jest.setSystemTime(new Date('2020-02-26T23:59:58.000Z'));
      const start = new Date('2020-02-27T00:00:00.000Z');

      const state = getCfpState('MEETUP', start);

      expect(state).toBe('CLOSED');
    });

    it('is OPENED if today between cfp start and end', () => {
      jest.setSystemTime(new Date('2020-02-27T23:59:58.000Z'));
      const start = new Date('2020-02-27T00:00:00.000Z');

      const state = getCfpState('MEETUP', start);

      expect(state).toBe('OPENED');
    });
  });
});
