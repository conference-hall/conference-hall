import { feelingAndNoteToMarker, getReviewMarkerOptions, markerToFeelingAndNote } from './review-markers.config.ts';

describe('review-markers.config', () => {
  describe('#getReviewMarkerOptions', () => {
    it('returns all marker options with labels', () => {
      const t = (key: string) => key;
      const options = getReviewMarkerOptions(t as never);

      expect(options).toHaveLength(8);
      expect(options[0]).toMatchObject({
        value: 'no-opinion',
        fill: 'fill-red-100',
        label: 'common.review.status.no-opinion',
      });
      expect(options[0]?.icon).toBeDefined();
      expect(options[2]).toMatchObject({ value: 'neutral-1', cumulative: true });
      expect(options[7]).toMatchObject({ value: 'positive', fill: 'fill-red-400' });
    });
  });

  describe('#markerToFeelingAndNote', () => {
    it('maps no-opinion marker', () => {
      expect(markerToFeelingAndNote('no-opinion')).toEqual({ feeling: 'NO_OPINION', note: null });
    });

    it('maps negative marker', () => {
      expect(markerToFeelingAndNote('negative')).toEqual({ feeling: 'NEGATIVE', note: 0 });
    });

    it('maps neutral markers to corresponding notes', () => {
      expect(markerToFeelingAndNote('neutral-1')).toEqual({ feeling: 'NEUTRAL', note: 1 });
      expect(markerToFeelingAndNote('neutral-2')).toEqual({ feeling: 'NEUTRAL', note: 2 });
      expect(markerToFeelingAndNote('neutral-3')).toEqual({ feeling: 'NEUTRAL', note: 3 });
      expect(markerToFeelingAndNote('neutral-4')).toEqual({ feeling: 'NEUTRAL', note: 4 });
      expect(markerToFeelingAndNote('neutral-5')).toEqual({ feeling: 'NEUTRAL', note: 5 });
    });

    it('maps positive marker', () => {
      expect(markerToFeelingAndNote('positive')).toEqual({ feeling: 'POSITIVE', note: 5 });
    });

    it('returns NO_OPINION for unknown marker', () => {
      expect(markerToFeelingAndNote('unknown')).toEqual({ feeling: 'NO_OPINION', note: null });
    });
  });

  describe('#feelingAndNoteToMarker', () => {
    it('returns null when feeling is null', () => {
      expect(feelingAndNoteToMarker(null, null)).toBeNull();
    });

    it('maps NO_OPINION feeling', () => {
      expect(feelingAndNoteToMarker('NO_OPINION', null)).toBe('no-opinion');
    });

    it('maps NEGATIVE feeling', () => {
      expect(feelingAndNoteToMarker('NEGATIVE', 0)).toBe('negative');
    });

    it('maps NEUTRAL feeling with notes', () => {
      expect(feelingAndNoteToMarker('NEUTRAL', 1)).toBe('neutral-1');
      expect(feelingAndNoteToMarker('NEUTRAL', 2)).toBe('neutral-2');
      expect(feelingAndNoteToMarker('NEUTRAL', 3)).toBe('neutral-3');
      expect(feelingAndNoteToMarker('NEUTRAL', 4)).toBe('neutral-4');
      expect(feelingAndNoteToMarker('NEUTRAL', 5)).toBe('neutral-5');
    });

    it('maps POSITIVE feeling', () => {
      expect(feelingAndNoteToMarker('POSITIVE', 5)).toBe('positive');
    });

    it('returns null for unmatched combination', () => {
      expect(feelingAndNoteToMarker('NEGATIVE', 3)).toBeNull();
    });
  });
});
