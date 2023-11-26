import { CallForPaper } from './CallForPaper';

describe('CallForPaper', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('#isOpen', () => {
    it('returns true when CFP is open', () => {
      vi.setSystemTime(new Date('2020-02-27T23:59:58.000Z'));
      const start = new Date('2020-02-27T00:00:00.000Z');
      const end = new Date('2020-02-27T23:59:59.000Z');

      const cfp = new CallForPaper({ type: 'CONFERENCE', cfpStart: start, cfpEnd: end });
      expect(cfp.isOpen).toBe(true);
    });
  });

  describe('#isClosed', () => {
    it('returns true when CFP is closed', () => {
      vi.setSystemTime(new Date('2020-02-27T13:00:00.000Z'));

      const cfp = new CallForPaper({ type: 'CONFERENCE', cfpStart: null, cfpEnd: null });
      expect(cfp.isClosed).toBe(true);
    });
  });

  describe('#state', () => {
    describe('For CONFERENCE', () => {
      it('is CLOSED if no cfp start or end are defined', () => {
        vi.setSystemTime(new Date('2020-02-27T13:00:00.000Z'));
        const cfp = new CallForPaper({ type: 'CONFERENCE', cfpStart: null, cfpEnd: null });

        expect(cfp.state).toBe('CLOSED');
      });

      it('is CLOSED if today is before cfp start', () => {
        vi.setSystemTime(new Date('2020-02-26T23:59:58.000Z'));
        const start = new Date('2020-02-27T00:00:00.000Z');
        const end = new Date('2020-02-27T23:59:59.000Z');

        const cfp = new CallForPaper({ type: 'CONFERENCE', cfpStart: start, cfpEnd: end });
        expect(cfp.state).toBe('CLOSED');
      });

      it('is OPENED if today between cfp start and end', () => {
        vi.setSystemTime(new Date('2020-02-27T23:59:58.000Z'));
        const start = new Date('2020-02-27T00:00:00.000Z');
        const end = new Date('2020-02-27T23:59:59.000Z');

        const cfp = new CallForPaper({ type: 'CONFERENCE', cfpStart: start, cfpEnd: end });
        expect(cfp.state).toBe('OPENED');
      });

      it('is FINISHED if today is after cfp end', () => {
        vi.setSystemTime(new Date('2020-02-28T00:00:00.000Z'));
        const start = new Date('2020-02-27T00:00:00.000Z');
        const end = new Date('2020-02-27T23:59:59.000Z');

        const cfp = new CallForPaper({ type: 'CONFERENCE', cfpStart: start, cfpEnd: end });
        expect(cfp.state).toBe('FINISHED');
      });
    });

    describe('For MEETUP', () => {
      it('is CLOSED if no cfp start or end are defined', () => {
        vi.setSystemTime(new Date('2020-02-27T13:00:00.000Z'));

        const cfp = new CallForPaper({ type: 'MEETUP', cfpStart: null, cfpEnd: null });
        expect(cfp.state).toBe('CLOSED');
      });

      it('is CLOSED if today is before cfp start', () => {
        vi.setSystemTime(new Date('2020-02-26T23:59:58.000Z'));
        const start = new Date('2020-02-27T00:00:00.000Z');

        const cfp = new CallForPaper({ type: 'MEETUP', cfpStart: start, cfpEnd: null });
        expect(cfp.state).toBe('CLOSED');
      });

      it('is OPENED if today between cfp start and end', () => {
        vi.setSystemTime(new Date('2020-02-27T23:59:58.000Z'));
        const start = new Date('2020-02-27T00:00:00.000Z');

        const cfp = new CallForPaper({ type: 'MEETUP', cfpStart: start, cfpEnd: null });
        expect(cfp.state).toBe('OPENED');
      });
    });
  });
});
