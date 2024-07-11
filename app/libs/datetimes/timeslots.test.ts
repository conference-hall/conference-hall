describe('timeslots', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-02-26T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('#generateDailyTimeSlots', () => {
    it('returns', async () => {});
  });
});
