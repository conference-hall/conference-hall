import { eventFactory } from '../../tests/factories/events.ts';

describe('Event model extensions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Event#isCfpOpen', () => {
    it('returns true when CFP is open', async () => {
      vi.setSystemTime(new Date('2020-02-27T23:59:58.000Z'));
      const event = await eventFactory({
        traits: ['conference'],
        attributes: { cfpStart: new Date('2020-02-27T00:00:00.000Z'), cfpEnd: new Date('2020-02-27T23:59:59.000Z') },
      });
      expect(event.isCfpOpen).toBe(true);
    });
  });

  describe('Event#cfpState', () => {
    describe('For CONFERENCE', () => {
      it('is CLOSED if no cfp start or end are defined', async () => {
        vi.setSystemTime(new Date('2020-02-27T13:00:00.000Z'));
        const event = await eventFactory({
          traits: ['conference'],
          attributes: { cfpStart: null, cfpEnd: null },
        });
        expect(event.cfpState).toBe('CLOSED');
      });

      it('is CLOSED if today is before cfp start', async () => {
        vi.setSystemTime(new Date('2020-02-26T23:59:58.000Z'));
        const event = await eventFactory({
          traits: ['conference'],
          attributes: { cfpStart: new Date('2020-02-27T00:00:00.000Z'), cfpEnd: new Date('2020-02-27T23:59:59.000Z') },
        });

        expect(event.cfpState).toBe('CLOSED');
      });

      it('is OPENED if today between cfp start and end', async () => {
        vi.setSystemTime(new Date('2020-02-27T23:59:58.000Z'));
        const event = await eventFactory({
          traits: ['conference'],
          attributes: { cfpStart: new Date('2020-02-27T00:00:00.000Z'), cfpEnd: new Date('2020-02-27T23:59:59.000Z') },
        });

        expect(event.cfpState).toBe('OPENED');
      });

      it('is FINISHED if today is after cfp end', async () => {
        vi.setSystemTime(new Date('2020-02-28T00:00:00.000Z'));
        const event = await eventFactory({
          traits: ['conference'],
          attributes: { cfpStart: new Date('2020-02-27T00:00:00.000Z'), cfpEnd: new Date('2020-02-27T23:59:59.000Z') },
        });
        expect(event.cfpState).toBe('FINISHED');
      });
    });

    describe('For MEETUP', () => {
      it('is CLOSED if no cfp start or end are defined', async () => {
        vi.setSystemTime(new Date('2020-02-27T13:00:00.000Z'));
        const event = await eventFactory({
          traits: ['meetup'],
          attributes: { cfpStart: null, cfpEnd: null },
        });

        expect(event.cfpState).toBe('CLOSED');
      });

      it('is CLOSED if today is before cfp start', async () => {
        vi.setSystemTime(new Date('2020-02-26T23:59:58.000Z'));
        const event = await eventFactory({
          traits: ['meetup'],
          attributes: { cfpStart: new Date('2020-02-27T00:00:00.000Z'), cfpEnd: null },
        });

        expect(event.cfpState).toBe('CLOSED');
      });

      it('is OPENED if today between cfp start and end', async () => {
        vi.setSystemTime(new Date('2020-02-27T23:59:58.000Z'));
        const event = await eventFactory({
          traits: ['meetup'],
          attributes: { cfpStart: new Date('2020-02-27T00:00:00.000Z'), cfpEnd: null },
        });

        expect(event.cfpState).toBe('OPENED');
      });
    });
  });
});
