import { addMinutes } from 'date-fns';
import type { ScheduleSession } from '../components/schedule.types.ts';
import { decodeGesture, DRAG_SOURCES, DROP_TARGETS, ScheduleGrid } from './schedule-grid.ts';

const day = new Date('2024-10-05T00:00:00.000Z');

const at = (hours: number, minutes = 0) =>
  new Date(`2024-10-05T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`);

const minutes = (hours: number, mins = 0) => hours * 60 + mins;

const slot = (hours: number, mins = 0) => ({ start: at(hours, mins), end: addMinutes(at(hours, mins), 5) });

const session = (id: string, trackId: string, start: Date, end: Date): ScheduleSession => ({
  id,
  trackId,
  timeslot: { start, end },
  color: 'stone',
  emojis: [],
  language: null,
});

type GridOptions = { start?: number; end?: number; sessions?: Array<ScheduleSession> };

const grid = ({ start = minutes(9), end = minutes(18), sessions = [] }: GridOptions = {}) =>
  new ScheduleGrid({
    day,
    displayedTimes: { start, end },
    tracks: [
      { id: 'track-1', name: 'Track 1' },
      { id: 'track-2', name: 'Track 2' },
    ],
    sessions,
  });

describe('ScheduleGrid', () => {
  describe('#rows', () => {
    it('builds an hour row per displayed hour, each divided into five-minute slots', () => {
      const rows = grid({ start: minutes(9), end: minutes(11) }).rows;

      expect(rows.map((row) => row.hour)).toEqual([
        { start: at(9), end: at(10) },
        { start: at(10), end: at(11) },
        { start: at(11), end: at(12) },
      ]);
      expect(rows[0].slots).toHaveLength(12);
      expect(rows[0].slots.at(0)).toEqual({ start: at(9), end: at(9, 5) });
      expect(rows[0].slots.at(-1)).toEqual({ start: at(9, 55), end: at(10) });
    });

    it('starts the rows at the first whole hour of a range not starting on the hour', () => {
      const rows = grid({ start: minutes(9, 30), end: minutes(11) }).rows;

      expect(rows.map((row) => row.hour)).toEqual([
        { start: at(10), end: at(11) },
        { start: at(11), end: at(12) },
      ]);
    });
  });

  describe('#sessionAt', () => {
    it('finds the session covering a slot of the track', () => {
      const talk = session('a', 'track-1', at(9), at(10));

      const found = grid({ sessions: [talk] }).sessionAt({ trackId: 'track-1', timeslot: slot(9, 30) });

      expect(found).toBe(talk);
    });

    it('finds nothing on a free slot', () => {
      const talk = session('a', 'track-1', at(9), at(10));

      const found = grid({ sessions: [talk] }).sessionAt({ trackId: 'track-1', timeslot: slot(10) });

      expect(found).toBeUndefined();
    });

    it('finds nothing on the same slot of another track', () => {
      const talk = session('a', 'track-1', at(9), at(10));

      const found = grid({ sessions: [talk] }).sessionAt({ trackId: 'track-2', timeslot: slot(9, 30) });

      expect(found).toBeUndefined();
    });
  });

  describe('#isSessionStart', () => {
    it('is the first slot of the session', () => {
      const talk = session('a', 'track-1', at(9), at(10));

      expect(grid({ sessions: [talk] }).isSessionStart({ trackId: 'track-1', timeslot: slot(9) })).toBe(true);
    });

    it('is not a later slot of the session', () => {
      const talk = session('a', 'track-1', at(9), at(10));

      expect(grid({ sessions: [talk] }).isSessionStart({ trackId: 'track-1', timeslot: slot(9, 30) })).toBe(false);
    });

    it('is not a free slot', () => {
      expect(grid().isSessionStart({ trackId: 'track-1', timeslot: slot(9) })).toBe(false);
    });
  });

  describe('#acceptsDropOnSlot', () => {
    const talk = session('a', 'track-1', at(9), at(10));
    const other = session('b', 'track-2', at(14), at(15));
    const occupied = { trackId: 'track-1', timeslot: slot(9, 30) };
    const free = { trackId: 'track-1', timeslot: slot(11) };

    it('accepts a move on a free slot', () => {
      expect(grid({ sessions: [talk, other] }).acceptsDropOnSlot(free, { kind: 'move', session: other })).toBe(true);
    });

    it('accepts a resize on a free slot', () => {
      expect(grid({ sessions: [talk, other] }).acceptsDropOnSlot(free, { kind: 'resize', session: other })).toBe(true);
    });

    it('accepts a move on an occupied slot from the session occupying it', () => {
      expect(grid({ sessions: [talk, other] }).acceptsDropOnSlot(occupied, { kind: 'move', session: talk })).toBe(true);
    });

    it('refuses a move on an occupied slot from another session', () => {
      expect(grid({ sessions: [talk, other] }).acceptsDropOnSlot(occupied, { kind: 'move', session: other })).toBe(
        false,
      );
    });

    it('accepts a resize on an occupied slot from the session occupying it', () => {
      expect(grid({ sessions: [talk, other] }).acceptsDropOnSlot(occupied, { kind: 'resize', session: talk })).toBe(
        true,
      );
    });

    // The resize is brought back to the session's own track by the placement rule, not by the grid.
    it('accepts a resize on an occupied slot from another session', () => {
      expect(grid({ sessions: [talk, other] }).acceptsDropOnSlot(occupied, { kind: 'resize', session: other })).toBe(
        true,
      );
    });

    it('refuses a drop from a source it does not own', () => {
      expect(grid({ sessions: [talk] }).acceptsDropOnSlot(free, null)).toBe(false);
    });
  });

  describe('#acceptsDropOnSession', () => {
    const talk = session('a', 'track-1', at(9), at(10));
    const other = session('b', 'track-2', at(14), at(15));

    it('accepts a move from another session, to swap the two', () => {
      expect(grid({ sessions: [talk, other] }).acceptsDropOnSession(talk, { kind: 'move', session: other })).toBe(true);
    });

    it('refuses a move from the session itself', () => {
      expect(grid({ sessions: [talk] }).acceptsDropOnSession(talk, { kind: 'move', session: talk })).toBe(false);
    });

    it('refuses a resize', () => {
      expect(grid({ sessions: [talk, other] }).acceptsDropOnSession(talk, { kind: 'resize', session: other })).toBe(
        false,
      );
    });
  });

  describe('#resizePreview', () => {
    it('follows the end of a free slot', () => {
      const talk = session('a', 'track-1', at(9), at(10));

      const preview = grid({ sessions: [talk] }).resizePreview(talk, { trackId: 'track-1', timeslot: slot(11) });

      expect(preview).toEqual({ start: at(9), end: at(11, 5) });
    });

    it('follows the end of a slot of the session being resized', () => {
      const talk = session('a', 'track-1', at(9), at(10));

      const preview = grid({ sessions: [talk] }).resizePreview(talk, { trackId: 'track-1', timeslot: slot(9, 30) });

      expect(preview).toEqual({ start: at(9), end: at(9, 35) });
    });

    it('stays put over a slot occupied by another session', () => {
      const talk = session('a', 'track-1', at(9), at(10));
      const next = session('b', 'track-1', at(11), at(12));

      const preview = grid({ sessions: [talk, next] }).resizePreview(talk, {
        trackId: 'track-1',
        timeslot: slot(11, 30),
      });

      expect(preview).toBeUndefined();
    });
  });

  describe('#draftWindow', () => {
    it('ends at the next session of the track', () => {
      const next = session('a', 'track-1', at(10), at(11));

      const window = grid({ sessions: [next] }).draftWindow({ trackId: 'track-1', timeslot: slot(9, 30) });

      expect(window).toEqual({ trackId: 'track-1', timeslot: { start: at(9, 30), end: at(10) } });
    });

    it('ends at the end of the displayed day', () => {
      const window = grid({ end: minutes(18) }).draftWindow({ trackId: 'track-1', timeslot: slot(18, 30) });

      expect(window).toEqual({ trackId: 'track-1', timeslot: { start: at(18, 30), end: at(19) } });
    });

    it('ignores a session of another track', () => {
      const elsewhere = session('a', 'track-2', at(10), at(11));

      const window = grid({ end: minutes(11), sessions: [elsewhere] }).draftWindow({
        trackId: 'track-1',
        timeslot: slot(9, 30),
      });

      expect(window).toEqual({ trackId: 'track-1', timeslot: { start: at(9, 30), end: at(12) } });
    });
  });

  describe('#canExtendDraft', () => {
    const next = session('a', 'track-1', at(10), at(11));
    const draft = { trackId: 'track-1', timeslot: slot(9, 30) };

    it('extends the draft on a slot of the window', () => {
      const model = grid({ sessions: [next] });
      const window = model.draftWindow(draft);

      expect(model.canExtendDraft(window, { trackId: 'track-1', timeslot: slot(9, 55) })).toBe(true);
    });

    it('shrinks the draft back on a slot already drawn', () => {
      const model = grid({ sessions: [next] });
      const window = model.draftWindow({ trackId: 'track-1', timeslot: slot(9, 30) });

      expect(model.canExtendDraft(window, { trackId: 'track-1', timeslot: slot(9, 35) })).toBe(true);
    });

    it('refuses a slot taken by the next session of the track', () => {
      const model = grid({ sessions: [next] });
      const window = model.draftWindow(draft);

      expect(model.canExtendDraft(window, { trackId: 'track-1', timeslot: slot(10) })).toBe(false);
    });

    it('refuses a slot above the start of the draft', () => {
      const model = grid({ sessions: [next] });
      const window = model.draftWindow(draft);

      expect(model.canExtendDraft(window, { trackId: 'track-1', timeslot: slot(9, 25) })).toBe(false);
    });

    it('refuses a slot of another track', () => {
      const model = grid({ sessions: [next] });
      const window = model.draftWindow(draft);

      expect(model.canExtendDraft(window, { trackId: 'track-2', timeslot: slot(9, 55) })).toBe(false);
    });

    it('refuses a slot past the end of the displayed day', () => {
      const model = grid({ end: minutes(18) });
      const window = model.draftWindow({ trackId: 'track-1', timeslot: slot(18, 50) });

      expect(model.canExtendDraft(window, { trackId: 'track-1', timeslot: slot(18, 55) })).toBe(true);
      expect(model.canExtendDraft(window, { trackId: 'track-1', timeslot: slot(19) })).toBe(false);
    });
  });

  describe('#isInsideDraft', () => {
    const draft = { trackId: 'track-1', timeslot: { start: at(9, 30), end: at(9, 45) } };

    it('covers a slot drawn by the draft', () => {
      expect(grid().isInsideDraft(draft, { trackId: 'track-1', timeslot: slot(9, 40) })).toBe(true);
    });

    it('does not cover a slot past the end of the draft', () => {
      expect(grid().isInsideDraft(draft, { trackId: 'track-1', timeslot: slot(9, 45) })).toBe(false);
    });

    it('does not cover the same slot of another track', () => {
      expect(grid().isInsideDraft(draft, { trackId: 'track-2', timeslot: slot(9, 40) })).toBe(false);
    });
  });
});

describe('decodeGesture', () => {
  const talk = session('a', 'track-1', at(9), at(10));
  const other = session('b', 'track-2', at(14), at(15));

  it('decodes a drop on a slot as a move', () => {
    const gesture = decodeGesture({
      canceled: false,
      operation: {
        source: { type: DRAG_SOURCES.move, data: { session: talk } },
        target: { type: DROP_TARGETS.timeslot, data: { trackId: 'track-2', timeslot: slot(11) } },
      },
    });

    expect(gesture).toEqual({ kind: 'move', session: talk, target: { trackId: 'track-2', start: at(11) } });
  });

  it('decodes a resize dropped on a slot as a resize to its end', () => {
    const gesture = decodeGesture({
      canceled: false,
      operation: {
        source: { type: DRAG_SOURCES.resize, data: { session: talk } },
        target: { type: DROP_TARGETS.timeslot, data: { trackId: 'track-1', timeslot: slot(11) } },
      },
    });

    expect(gesture).toEqual({ kind: 'resize', session: talk, end: at(11, 5) });
  });

  it('decodes a drop on a session as a swap', () => {
    const gesture = decodeGesture({
      canceled: false,
      operation: {
        source: { type: DRAG_SOURCES.move, data: { session: talk } },
        target: { type: DROP_TARGETS.session, data: { session: other } },
      },
    });

    expect(gesture).toEqual({ kind: 'swap', source: talk, target: other });
  });

  it('decodes nothing from a canceled drag', () => {
    const gesture = decodeGesture({
      canceled: true,
      operation: {
        source: { type: DRAG_SOURCES.move, data: { session: talk } },
        target: { type: DROP_TARGETS.timeslot, data: { trackId: 'track-2', timeslot: slot(11) } },
      },
    });

    expect(gesture).toBeNull();
  });

  it('decodes nothing from a drag without a target', () => {
    const gesture = decodeGesture({
      canceled: false,
      operation: { source: { type: DRAG_SOURCES.move, data: { session: talk } }, target: null },
    });

    expect(gesture).toBeNull();
  });

  it('decodes nothing from a resize dropped on a session', () => {
    const gesture = decodeGesture({
      canceled: false,
      operation: {
        source: { type: DRAG_SOURCES.resize, data: { session: talk } },
        target: { type: DROP_TARGETS.session, data: { session: other } },
      },
    });

    expect(gesture).toBeNull();
  });
});
