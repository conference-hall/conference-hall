import { cfpColorStatus, formatCFPDate, formatCFPElapsedTime, formatCFPState, formatConferenceDates } from './cfp.ts';

describe('#formatConferenceDates', () => {
  it('return one day conference info', () => {
    const message = formatConferenceDates(
      'Europe/Paris',
      new Date('2020-10-05T00:00:00.000Z'),
      new Date('2020-10-05T00:00:00.000Z'),
    );
    expect(message).toBe('October 5th, 2020 (GMT+2)');
  });

  it('return several days conference info', () => {
    const message = formatConferenceDates(
      'Europe/Paris',
      new Date('2020-10-05T00:00:00.000Z'),
      new Date('2020-10-07T00:00:00.000Z'),
    );
    expect(message).toBe('October 5th to October 7th, 2020 (GMT+2)');
  });
});

describe('#formatCFPState', () => {
  it('return disabled cfp message', () => {
    const message = formatCFPState('CLOSED', null, null);
    expect(message).toBe('Call for paper is disabled');
  });

  it('return closed cfp message', () => {
    const message = formatCFPState(
      'CLOSED',
      new Date('2020-10-05T00:00:00.000Z'),
      new Date('2020-10-07T00:00:00.000Z'),
    );
    expect(message).toBe('Opening soon');
  });

  it('return opened cfp message', () => {
    const message = formatCFPState(
      'OPENED',
      new Date('2020-10-05T00:00:00.000Z'),
      new Date('2020-10-07T00:00:00.000Z'),
    );
    expect(message).toBe('Call for paper open');
  });

  it('return finished cfp message', () => {
    const message = formatCFPState(
      'FINISHED',
      new Date('2020-10-05T00:00:00.000Z'),
      new Date('2020-10-07T00:00:00.000Z'),
    );
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

  it('return "CFP disabled" if no dates', () => {
    const message = formatCFPElapsedTime('CLOSED', null, null);
    expect(message).toBe('Call for paper is disabled');
  });

  it('returns closed CFP', () => {
    vi.setSystemTime(new Date('2020-02-26T00:00:00.000Z'));
    const start = new Date('2020-02-27T00:00:00.000Z');
    const end = new Date('2020-02-28T23:59:59.000Z');
    const message = formatCFPElapsedTime('CLOSED', start, end);
    expect(message).toBe('Call for paper open in 1 day');
  });

  it('returns opened CFP', () => {
    vi.setSystemTime(new Date('2020-02-27T12:00:00.000Z'));
    const start = new Date('2020-02-27T00:00:00.000Z');
    const end = new Date('2020-02-28T23:59:59.000Z');
    const message = formatCFPElapsedTime('OPENED', start, end);
    expect(message).toBe('Call for paper open for 1 day');
  });

  it('returns finished CFP', () => {
    vi.setSystemTime(new Date('2020-02-30T00:00:00.000Z'));
    const start = new Date('2020-02-27T00:00:00.000Z');
    const end = new Date('2020-02-28T23:59:59.000Z');
    const message = formatCFPElapsedTime('FINISHED', start, end);
    expect(message).toBe('Call for paper closed since 1 day');
  });
});

describe('#formatCFPDate', () => {
  it('return undefined if no dates', () => {
    const message = formatCFPDate('CLOSED', 'Europe/Paris', null, null);
    expect(message).toBeUndefined();
  });

  it('return undefined if only start date', () => {
    const message = formatCFPDate('CLOSED', 'Europe/Paris', new Date('2020-10-05T00:00:00.000Z'), null);
    expect(message).toBeUndefined();
  });

  it('return the date when the cfp will be open', () => {
    const message = formatCFPDate(
      'CLOSED',
      'Europe/Paris',
      new Date('2020-10-05T00:00:00.000Z'),
      new Date('2020-10-07T00:00:00.000Z'),
    );
    expect(message).toBe('Open on Monday, October 5th, 2020 at 2:00 AM (GMT+2)');
  });

  it('return the date when the cfp will be closed', () => {
    const message = formatCFPDate(
      'OPENED',
      'Europe/Paris',
      new Date('2020-10-05T00:00:00.000Z'),
      new Date('2020-10-07T00:00:00.000Z'),
    );
    expect(message).toBe('Open until Wednesday, October 7th, 2020 at 2:00 AM (GMT+2)');
  });

  it('return the date when the cfp is finished', () => {
    const message = formatCFPDate(
      'FINISHED',
      'Europe/Paris',
      new Date('2020-10-05T00:00:00.000Z'),
      new Date('2020-10-07T00:00:00.000Z'),
    );
    expect(message).toBe('Closed since Wednesday, October 7th, 2020 at 2:00 AM (GMT+2)');
  });

  it('return the date in another format', () => {
    const message = formatCFPDate(
      'FINISHED',
      'Europe/Paris',
      new Date('2020-10-05T00:00:00.000Z'),
      new Date('2020-10-07T00:00:00.000Z'),
      'Pp (z)',
    );
    expect(message).toBe('Closed since 10/07/2020, 2:00 AM (GMT+2)');
  });
});

describe('#cfpColorStatus', () => {
  it('return "disabled" status color if no dates', () => {
    const message = cfpColorStatus('CLOSED', null, null);
    expect(message).toBe('disabled');
  });

  it('return "warning" status color if cfp closed', () => {
    const message = cfpColorStatus(
      'CLOSED',
      new Date('2020-10-05T00:00:00.000Z'),
      new Date('2020-10-07T00:00:00.000Z'),
    );
    expect(message).toBe('warning');
  });

  it('return "success" status color if cfp open', () => {
    const message = cfpColorStatus(
      'OPENED',
      new Date('2020-10-05T00:00:00.000Z'),
      new Date('2020-10-07T00:00:00.000Z'),
    );
    expect(message).toBe('success');
  });

  it('return "error" status color if cfp finished', () => {
    const message = cfpColorStatus(
      'FINISHED',
      new Date('2020-10-05T00:00:00.000Z'),
      new Date('2020-10-07T00:00:00.000Z'),
    );
    expect(message).toBe('error');
  });
});
