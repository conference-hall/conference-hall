import { SessionPlacement } from './session-placement.ts';

const at = (hours: number, minutes = 0) =>
  new Date(`2024-10-05T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`);

const session = (id: string, trackId: string, start: Date, end: Date) => ({ id, trackId, timeslot: { start, end } });

describe('SessionPlacement', () => {
  describe('#place', () => {
    it('places a session into an empty schedule', () => {
      const placement = new SessionPlacement([]);

      const outcome = placement.place({ trackId: 'track-1', timeslot: { start: at(9), end: at(10) } });

      expect(outcome).toEqual({
        status: 'placed',
        placement: { trackId: 'track-1', timeslot: { start: at(9), end: at(10) } },
      });
    });

    it('places a session into an empty track', () => {
      const placement = new SessionPlacement([session('a', 'track-1', at(9), at(10))]);

      const outcome = placement.place({ trackId: 'track-2', timeslot: { start: at(9), end: at(10) } });

      expect(outcome.status).toBe('placed');
    });

    it('refuses a session overlapping another session of the same track', () => {
      const other = session('a', 'track-1', at(9), at(11));
      const placement = new SessionPlacement([other]);

      const outcome = placement.place({ trackId: 'track-1', timeslot: { start: at(10), end: at(12) } });

      expect(outcome).toEqual({ status: 'conflict', conflictingSession: other });
    });

    it('places a session starting exactly when another session of the same track ends', () => {
      const placement = new SessionPlacement([session('a', 'track-1', at(9), at(10))]);

      const outcome = placement.place({ trackId: 'track-1', timeslot: { start: at(10), end: at(11) } });

      expect(outcome.status).toBe('placed');
    });

    it('places a session overlapping another session of a different track', () => {
      const placement = new SessionPlacement([session('a', 'track-1', at(9), at(11))]);

      const outcome = placement.place({ trackId: 'track-2', timeslot: { start: at(10), end: at(12) } });

      expect(outcome.status).toBe('placed');
    });

    it('excludes the placed session from its own check', () => {
      const moved = session('a', 'track-1', at(9), at(11));
      const placement = new SessionPlacement([moved]);

      const outcome = placement.place({ trackId: 'track-1', timeslot: { start: at(10), end: at(12) } }, moved.id);

      expect(outcome.status).toBe('placed');
    });
  });

  describe('#move', () => {
    it('moves a session to another track without adjusting it', () => {
      const moved = session('a', 'track-1', at(9), at(10));
      const placement = new SessionPlacement([moved, session('b', 'track-2', at(15), at(16))]);

      const outcome = placement.move(moved, { trackId: 'track-2', start: at(11) });

      expect(outcome).toEqual({
        status: 'placed',
        placement: { trackId: 'track-2', timeslot: { start: at(11), end: at(12) } },
      });
    });

    it('adjusts the end to the next session of the target track', () => {
      const moved = session('a', 'track-1', at(9), at(11));
      const placement = new SessionPlacement([moved, session('b', 'track-2', at(12), at(13))]);

      const outcome = placement.move(moved, { trackId: 'track-2', start: at(11) });

      expect(outcome).toEqual({
        status: 'adjusted',
        placement: { trackId: 'track-2', timeslot: { start: at(11), end: at(12) } },
      });
    });

    it('refuses a move onto a start already taken by another session of the track', () => {
      const moved = session('a', 'track-1', at(9), at(10));
      const blocking = session('b', 'track-2', at(11), at(13));
      const placement = new SessionPlacement([moved, blocking]);

      const outcome = placement.move(moved, { trackId: 'track-2', start: at(12) });

      expect(outcome).toEqual({ status: 'conflict', conflictingSession: blocking });
    });
  });

  describe('#resize', () => {
    it('resizes a session with no following session', () => {
      const resized = session('a', 'track-1', at(9), at(10));
      const placement = new SessionPlacement([resized]);

      const outcome = placement.resize(resized, at(12));

      expect(outcome).toEqual({
        status: 'placed',
        placement: { trackId: 'track-1', timeslot: { start: at(9), end: at(12) } },
      });
    });

    it('adjusts the end to the start of the next session of the track', () => {
      const resized = session('a', 'track-1', at(9), at(10));
      const placement = new SessionPlacement([resized, session('b', 'track-1', at(11), at(12))]);

      const outcome = placement.resize(resized, at(14));

      expect(outcome).toEqual({
        status: 'adjusted',
        placement: { trackId: 'track-1', timeslot: { start: at(9), end: at(11) } },
      });
    });

    it('adjusts the end to a minimum length when it is not after the start', () => {
      const resized = session('a', 'track-1', at(9), at(10));
      const placement = new SessionPlacement([resized]);

      const outcome = placement.resize(resized, at(8));

      expect(outcome).toEqual({
        status: 'adjusted',
        placement: { trackId: 'track-1', timeslot: { start: at(9), end: at(9, 5) } },
      });
    });
  });

  describe('#swap', () => {
    it('swaps the track and the start time of two sessions of equal duration', () => {
      const source = session('a', 'track-1', at(9), at(10));
      const target = session('b', 'track-2', at(14), at(15));
      const placement = new SessionPlacement([source, target]);

      const outcome = placement.swap(source, target);

      expect(outcome).toEqual({
        status: 'placed',
        source: { trackId: 'track-2', timeslot: { start: at(14), end: at(15) } },
        target: { trackId: 'track-1', timeslot: { start: at(9), end: at(10) } },
      });
    });

    it('refuses a swap of two sessions of different durations overlapping a neighbour', () => {
      const source = session('a', 'track-1', at(9), at(10));
      const target = session('b', 'track-2', at(14), at(16));
      const neighbour = session('c', 'track-1', at(10, 30), at(12));
      const placement = new SessionPlacement([source, target, neighbour]);

      const outcome = placement.swap(source, target);

      expect(outcome).toEqual({ status: 'conflict', conflictingSession: neighbour });
    });

    it('swaps a session with itself', () => {
      const source = session('a', 'track-1', at(9), at(10));
      const placement = new SessionPlacement([source]);

      const outcome = placement.swap(source, source);

      expect(outcome).toEqual({
        status: 'placed',
        source: { trackId: 'track-1', timeslot: { start: at(9), end: at(10) } },
        target: { trackId: 'track-1', timeslot: { start: at(9), end: at(10) } },
      });
    });
  });
});
