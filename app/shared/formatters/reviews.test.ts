import { formatReviewNote } from './reviews.ts';

describe('#formatReviewNote', () => {
  it('returns null if no notes', () => {
    expect(formatReviewNote(null)).toBe(null);
    expect(formatReviewNote(undefined)).toBe(null);
  });

  it('returns formatted notes', () => {
    expect(formatReviewNote(0)).toBe('0');
    expect(formatReviewNote(1)).toBe('1');
    expect(formatReviewNote(1.1)).toBe('1.1');
    expect(formatReviewNote(1.12)).toBe('1.1');
    expect(formatReviewNote(1.15)).toBe('1.2');
    expect(formatReviewNote(1.167)).toBe('1.2');
  });
});
