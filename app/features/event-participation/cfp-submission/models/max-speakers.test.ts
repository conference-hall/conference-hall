import { isMaxSpeakersExceeded, isMaxSpeakersReached } from './max-speakers.ts';

describe('isMaxSpeakersReached', () => {
  it('is false without limit', () => {
    expect(isMaxSpeakersReached(5, null)).toBe(false);
  });

  it('is false below the limit', () => {
    expect(isMaxSpeakersReached(1, 2)).toBe(false);
  });

  it('is true at the limit', () => {
    expect(isMaxSpeakersReached(2, 2)).toBe(true);
  });

  it('is true above the limit', () => {
    expect(isMaxSpeakersReached(3, 2)).toBe(true);
  });
});

describe('isMaxSpeakersExceeded', () => {
  it('is false without limit', () => {
    expect(isMaxSpeakersExceeded(5, null)).toBe(false);
  });

  it('is false at the limit', () => {
    expect(isMaxSpeakersExceeded(2, 2)).toBe(false);
  });

  it('is true above the limit', () => {
    expect(isMaxSpeakersExceeded(3, 2)).toBe(true);
  });
});
