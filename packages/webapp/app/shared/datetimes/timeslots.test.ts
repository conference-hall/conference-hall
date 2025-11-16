import {
  areTimeSlotsOverlapping,
  countIntervalsInTimeSlot,
  getDailyTimeSlots,
  haveSameStartDate,
  isAfterTimeSlot,
  isNextTimeslotInWindow,
  isTimeSlotIncluded,
  mergeTimeslots,
  moveTimeSlotStart,
} from './timeslots.ts';

describe('timeslots', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-02-26T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('#getDailyTimeSlots', () => {
    it('returns timeslots for a full day and with an 60 minutes interval', async () => {
      const startTime = new Date('2020-02-26T00:00:00.000Z');
      const endTime = new Date('2020-02-26T23:59:59.999Z');

      const timeslots = getDailyTimeSlots(startTime, endTime, 60);

      expect(timeslots.length).toBe(24);

      expect(timeslots.at(0)?.start.toISOString()).toBe('2020-02-26T00:00:00.000Z');
      expect(timeslots.at(0)?.end.toISOString()).toBe('2020-02-26T01:00:00.000Z');

      expect(timeslots.at(-1)?.start.toISOString()).toBe('2020-02-26T23:00:00.000Z');
      expect(timeslots.at(-1)?.end.toISOString()).toBe('2020-02-26T23:59:59.999Z');
    });

    it('returns timeslots between 2 times for the given day and with an 30 minutes interval', async () => {
      const startTime = new Date('2020-02-26T10:00:00.000Z');
      const endTime = new Date('2020-02-26T12:00:00.000Z');

      const timeslots = getDailyTimeSlots(startTime, endTime, 30);

      expect(timeslots.length).toBe(4);

      expect(timeslots.at(0)?.start.toISOString()).toBe('2020-02-26T10:00:00.000Z');
      expect(timeslots.at(0)?.end.toISOString()).toBe('2020-02-26T10:30:00.000Z');

      expect(timeslots.at(-1)?.start.toISOString()).toBe('2020-02-26T11:30:00.000Z');
      expect(timeslots.at(-1)?.end.toISOString()).toBe('2020-02-26T12:00:00.000Z');
    });

    it('returns timeslots including the last timeslot with starting with end date', async () => {
      const startTime = new Date('2020-02-26T10:00:00.000Z');
      const endTime = new Date('2020-02-26T12:00:00.000Z');

      const timeslots = getDailyTimeSlots(startTime, endTime, 30, true);

      expect(timeslots.length).toBe(5);

      expect(timeslots.at(-1)?.start.toISOString()).toBe('2020-02-26T12:00:00.000Z');
      expect(timeslots.at(-1)?.end.toISOString()).toBe('2020-02-26T12:30:00.000Z');
    });
  });

  describe('#isAfterTimeSlot', () => {
    it('returns true if a timeslot start if after another one', async () => {
      const timeslot1 = {
        start: new Date('2020-02-26T11:00:00.000Z'),
        end: new Date('2020-02-26T11:30:00.000Z'),
      };

      const timeslot2 = {
        start: new Date('2020-02-26T10:00:00.000Z'),
        end: new Date('2020-02-26T10:30:00.000Z'),
      };

      const result = isAfterTimeSlot(timeslot1, timeslot2);

      expect(result).toBe(true);
    });

    it('returns false if a timeslot start if before another one', async () => {
      const timeslot1 = {
        start: new Date('2020-02-26T10:00:00.000Z'),
        end: new Date('2020-02-26T10:30:00.000Z'),
      };

      const timeslot2 = {
        start: new Date('2020-02-26T11:00:00.000Z'),
        end: new Date('2020-02-26T11:30:00.000Z'),
      };

      const result = isAfterTimeSlot(timeslot1, timeslot2);

      expect(result).toBe(false);
    });

    it('returns false if timeslots have the same start date', async () => {
      const timeslot1 = {
        start: new Date('2020-02-26T10:00:00.000Z'),
        end: new Date('2020-02-26T10:30:00.000Z'),
      };

      const timeslot2 = {
        start: new Date('2020-02-26T10:00:00.000Z'),
        end: new Date('2020-02-26T10:30:00.000Z'),
      };

      const result = isAfterTimeSlot(timeslot1, timeslot2);

      expect(result).toBe(false);
    });
  });

  describe('#haveSameStartDate', () => {
    it('returns true if timeslots have the same start date', async () => {
      const timeslot1 = {
        start: new Date('2020-02-26T10:00:00.000Z'),
        end: new Date('2020-02-26T10:30:00.000Z'),
      };

      const timeslot2 = {
        start: new Date('2020-02-26T10:00:00.000Z'),
        end: new Date('2020-02-26T10:30:00.000Z'),
      };

      const result = haveSameStartDate(timeslot1, timeslot2);

      expect(result).toBe(true);
    });

    it('returns true if timeslots have different start date', async () => {
      const timeslot1 = {
        start: new Date('2020-02-26T11:00:00.000Z'),
        end: new Date('2020-02-26T11:30:00.000Z'),
      };

      const timeslot2 = {
        start: new Date('2020-02-26T10:00:00.000Z'),
        end: new Date('2020-02-26T10:30:00.000Z'),
      };

      const result = haveSameStartDate(timeslot1, timeslot2);

      expect(result).toBe(false);
    });
  });

  describe('#isTimeSlotIncluded', () => {
    it('returns true a timeslot is included in another one', async () => {
      const timeslot = {
        start: new Date('2020-02-26T10:00:00.000Z'),
        end: new Date('2020-02-26T10:30:00.000Z'),
      };

      const inSlot = {
        start: new Date('2020-02-26T09:00:00.000Z'),
        end: new Date('2020-02-26T11:30:00.000Z'),
      };

      const result = isTimeSlotIncluded(timeslot, inSlot);

      expect(result).toBe(true);
    });

    it('returns true a timeslot is exactly in another one', async () => {
      const timeslot1 = {
        start: new Date('2020-02-26T10:00:00.000Z'),
        end: new Date('2020-02-26T10:30:00.000Z'),
      };

      const timeslot2 = {
        start: new Date('2020-02-26T10:00:00.000Z'),
        end: new Date('2020-02-26T10:30:00.000Z'),
      };

      const result = isTimeSlotIncluded(timeslot1, timeslot2);

      expect(result).toBe(true);
    });

    it('returns false if timeslots are partially overlapped', async () => {
      const timeslot1 = {
        start: new Date('2020-02-26T10:00:00.000Z'),
        end: new Date('2020-02-26T10:30:00.000Z'),
      };

      const timeslot2 = {
        start: new Date('2020-02-26T10:15:00.000Z'),
        end: new Date('2020-02-26T11:30:00.000Z'),
      };

      const result = isTimeSlotIncluded(timeslot1, timeslot2);

      expect(result).toBe(false);
    });

    it('returns false if the in slot checked is not given', async () => {
      const timeslot = {
        start: new Date('2020-02-26T10:00:00.000Z'),
        end: new Date('2020-02-26T10:30:00.000Z'),
      };

      const result = isTimeSlotIncluded(timeslot);

      expect(result).toBe(false);
    });
  });

  describe('#isNextTimeslotInWindow', () => {
    it('returns true when next timeslot is within window', async () => {
      const startSlot = {
        start: new Date('2020-02-26T10:00:00.000Z'),
        end: new Date('2020-02-26T10:30:00.000Z'),
      };

      const nextSlot = {
        start: new Date('2020-02-26T11:00:00.000Z'),
        end: new Date('2020-02-26T11:30:00.000Z'),
      };

      const result = isNextTimeslotInWindow(startSlot, nextSlot, 30);

      expect(result).toBe(true);
    });

    it('returns false when next timeslot is outside window', async () => {
      const startSlot = {
        start: new Date('2020-02-26T10:00:00.000Z'),
        end: new Date('2020-02-26T10:30:00.000Z'),
      };

      const nextSlot = {
        start: new Date('2020-02-26T22:00:00.000Z'),
        end: new Date('2020-02-26T22:30:00.000Z'),
      };

      const result = isNextTimeslotInWindow(startSlot, nextSlot, 30);

      expect(result).toBe(false);
    });

    it('works with custom window size', async () => {
      const startSlot = {
        start: new Date('2020-02-26T10:00:00.000Z'),
        end: new Date('2020-02-26T10:30:00.000Z'),
      };

      const nextSlot = {
        start: new Date('2020-02-26T11:00:00.000Z'),
        end: new Date('2020-02-26T11:30:00.000Z'),
      };

      const result = isNextTimeslotInWindow(startSlot, nextSlot, 30, 1);

      expect(result).toBe(false);
    });

    it('returns true when next timeslot is exactly at window boundary', async () => {
      const startSlot = {
        start: new Date('2020-02-26T10:00:00.000Z'),
        end: new Date('2020-02-26T10:30:00.000Z'),
      };

      const nextSlot = {
        start: new Date('2020-02-26T10:30:00.000Z'),
        end: new Date('2020-02-26T11:00:00.000Z'),
      };

      const result = isNextTimeslotInWindow(startSlot, nextSlot, 30, 2);

      expect(result).toBe(true);
    });
  });
});

describe('#areTimeSlotsOverlapping', () => {
  it('returns true a timeslot is included in another one', async () => {
    const timeslot = {
      start: new Date('2020-02-26T10:00:00.000Z'),
      end: new Date('2020-02-26T10:30:00.000Z'),
    };

    const inSlot = {
      start: new Date('2020-02-26T09:00:00.000Z'),
      end: new Date('2020-02-26T11:30:00.000Z'),
    };

    const result = areTimeSlotsOverlapping(timeslot, inSlot);

    expect(result).toBe(true);
  });

  it('returns true if timeslots are partially overlapped', async () => {
    const timeslot1 = {
      start: new Date('2020-02-26T10:00:00.000Z'),
      end: new Date('2020-02-26T10:30:00.000Z'),
    };

    const timeslot2 = {
      start: new Date('2020-02-26T10:15:00.000Z'),
      end: new Date('2020-02-26T11:30:00.000Z'),
    };

    const result = areTimeSlotsOverlapping(timeslot1, timeslot2);

    expect(result).toBe(true);
  });

  it('returns false if timeslots are not overlapped', async () => {
    const timeslot1 = {
      start: new Date('2020-02-26T10:00:00.000Z'),
      end: new Date('2020-02-26T10:30:00.000Z'),
    };

    const timeslot2 = {
      start: new Date('2020-02-26T11:15:00.000Z'),
      end: new Date('2020-02-26T11:30:00.000Z'),
    };

    const result = areTimeSlotsOverlapping(timeslot1, timeslot2);

    expect(result).toBe(false);
  });
});

describe('#countIntervalsInTimeSlot', () => {
  it('returns the number of intervals in a timeslot', async () => {
    const timeslot = {
      start: new Date('2020-02-26T10:00:00.000Z'),
      end: new Date('2020-02-26T10:30:00.000Z'),
    };

    const result = countIntervalsInTimeSlot(timeslot, 5);

    expect(result).toBe(6);
  });
});

describe('#moveTimeSlotStart', () => {
  it('changes timeslot start keeping its duration', async () => {
    const timeslot = {
      start: new Date('2020-02-26T10:00:00.000Z'),
      end: new Date('2020-02-26T10:30:00.000Z'),
    };

    const result = moveTimeSlotStart(timeslot, new Date('2020-02-26T11:00:00.000Z'));

    expect(result).toEqual({
      start: new Date('2020-02-26T11:00:00.000Z'),
      end: new Date('2020-02-26T11:30:00.000Z'),
    });
  });
});

describe('#mergeTimeslots', () => {
  it('merges two timeslots', async () => {
    const timeslot1 = {
      start: new Date('2020-02-26T10:00:00.000Z'),
      end: new Date('2020-02-26T10:30:00.000Z'),
    };

    const timeslot2 = {
      start: new Date('2020-02-26T10:15:00.000Z'),
      end: new Date('2020-02-26T11:30:00.000Z'),
    };

    const result1 = mergeTimeslots(timeslot1, timeslot2);

    expect(result1).toEqual({
      start: new Date('2020-02-26T10:00:00.000Z'),
      end: new Date('2020-02-26T11:30:00.000Z'),
    });

    const result2 = mergeTimeslots(timeslot2, timeslot1);

    expect(result2).toEqual({
      start: new Date('2020-02-26T10:00:00.000Z'),
      end: new Date('2020-02-26T11:30:00.000Z'),
    });
  });
});
