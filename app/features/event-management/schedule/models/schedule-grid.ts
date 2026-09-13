import { addMinutes } from 'date-fns';
import type { TimeSlot } from '~/shared/datetimes/timeslots.ts';
import { getDailyTimeSlots, haveSameStartDate, isTimeSlotIncluded } from '~/shared/datetimes/timeslots.ts';
import type { ScheduleSession, Track } from '../components/schedule.types.ts';
import { SessionPlacement } from './session-placement.ts';

// Owns every decision the grid of one displayed day makes: its hour rows and slots, which Session occupies a
// slot, whether a slot accepts a drag source, what a resize preview shows, and how far a Session draft may be
// extended. It owns no pixel and never imports the drag-and-drop library.
// Time reference contract: everything it receives is in the Schedule timezone, it converts nothing.

const HOUR_INTERVAL = 60; // minutes
export const SLOT_INTERVAL = 5; // minutes

// Id given to a draft while the placement rule computes its extension window: a draft is not a Session yet.
const DRAFT_SESSION_ID = 'session-draft';

// Type identifiers registered with the drag-and-drop library, read back by the gesture decoder.
export const DRAG_SOURCES = { move: 'move-session', resize: 'resize-session' } as const;
export const DROP_TARGETS = { timeslot: 'timeslot-drop', session: 'session-drop' } as const;

// Payloads carried by the draggables and droppables of the grid.
export type SessionSourcePayload = { session: ScheduleSession };
export type TimeslotTargetPayload = { trackId: string; timeslot: TimeSlot };
export type SessionTargetPayload = { session: ScheduleSession };

// Minimal structural view of a draggable, a droppable and a drag end event of the drag-and-drop library.
type DragEntry = { type?: string | number | symbol | object; data: Record<string, unknown> };

export type DragEndEvent = {
  canceled: boolean;
  operation: { source: DragEntry | null; target: DragEntry | null };
};

export type DragSource = { kind: 'move' | 'resize'; session: ScheduleSession };

export type Gesture =
  | { kind: 'move'; session: ScheduleSession; target: { trackId: string; start: Date } }
  | { kind: 'resize'; session: ScheduleSession; end: Date }
  | { kind: 'swap'; source: ScheduleSession; target: ScheduleSession };

// A Session being drawn over the free slots of a Track, until the pointer is released.
export type SessionDraft = { trackId: string; timeslot: TimeSlot };

// The Track and the time span a draft may be extended into.
export type DraftWindow = { trackId: string; timeslot: TimeSlot };

export type GridRow = { hour: TimeSlot; slots: Array<TimeSlot> };

type GridTarget = { trackId: string; timeslot: TimeSlot };

type ScheduleGridInput = {
  day: Date;
  displayedTimes: { start: number; end: number };
  tracks: Array<Track>;
  sessions: Array<ScheduleSession>;
};

export class ScheduleGrid {
  private placement: SessionPlacement;
  private gridRows?: Array<GridRow>;

  constructor(private grid: ScheduleGridInput) {
    this.placement = new SessionPlacement(grid.sessions);
  }

  get tracks(): Array<Track> {
    return this.grid.tracks;
  }

  // The hour rows of the displayed day, each with the slots it is divided into.
  get rows(): Array<GridRow> {
    if (this.gridRows) return this.gridRows;

    const { day, displayedTimes } = this.grid;
    const hours = getDailyTimeSlots(
      addMinutes(day, displayedTimes.start),
      addMinutes(day, displayedTimes.end),
      HOUR_INTERVAL,
      true,
    );

    this.gridRows = hours.map((hour) => ({ hour, slots: getDailyTimeSlots(hour.start, hour.end, SLOT_INTERVAL) }));
    return this.gridRows;
  }

  // The Session occupying a slot of a Track, if any.
  sessionAt({ trackId, timeslot }: GridTarget): ScheduleSession | undefined {
    return this.grid.sessions.find(
      (session) => session.trackId === trackId && isTimeSlotIncluded(timeslot, session.timeslot),
    );
  }

  // Whether a slot is the first slot of the Session occupying it: the slot rendering its block.
  isSessionStart(target: GridTarget): boolean {
    const session = this.sessionAt(target);
    return Boolean(session && haveSameStartDate(target.timeslot, session.timeslot));
  }

  // A free slot accepts any source. An occupied slot accepts a resize from any Session, and a move only from
  // the Session occupying it.
  acceptsDropOnSlot(target: GridTarget, source: DragSource | null): boolean {
    if (!source) return false;

    const session = this.sessionAt(target);
    if (!session) return true;
    if (source.kind === 'resize') return true;
    return session.id === source.session.id;
  }

  // A Session block accepts a move from another Session: dropping one onto the other swaps them.
  acceptsDropOnSession(target: ScheduleSession, source: DragSource | null): boolean {
    if (!source) return false;
    return source.kind === 'move' && source.session.id !== target.id;
  }

  // The time slot a Session shows while its resize pointer is over a slot. Nothing when the slot is occupied by
  // another Session: the preview then stays put rather than showing a length the Schedule would refuse.
  resizePreview(session: ScheduleSession, target: GridTarget): TimeSlot | undefined {
    const occupying = this.sessionAt(target);
    if (occupying && occupying.id !== session.id) return undefined;
    return { start: session.timeslot.start, end: target.timeslot.end };
  }

  // The window a draft may be extended into: from its start to the next Session of its Track, bounded by the
  // end of the displayed day. Computed once per draft, extending a slot is then a containment test on it.
  draftWindow(draft: SessionDraft): DraftWindow {
    const outcome = this.placement.resize({ id: DRAFT_SESSION_ID, ...draft }, this.displayedEnd);
    if (outcome.status === 'conflict') return draft;
    return { trackId: draft.trackId, timeslot: outcome.placement.timeslot };
  }

  // Whether a slot extends the draft: same Track, inside the extension window.
  canExtendDraft(window: DraftWindow, target: GridTarget): boolean {
    if (target.trackId !== window.trackId) return false;
    return isTimeSlotIncluded(target.timeslot, window.timeslot);
  }

  // Whether a slot is covered by the draft as drawn so far.
  isInsideDraft(draft: SessionDraft, target: GridTarget): boolean {
    if (target.trackId !== draft.trackId) return false;
    return isTimeSlotIncluded(target.timeslot, draft.timeslot);
  }

  // The displayed day ends with the last of its hour rows.
  private get displayedEnd(): Date {
    const lastRow = this.rows.at(-1);
    return lastRow ? lastRow.hour.end : addMinutes(this.grid.day, this.grid.displayedTimes.end);
  }
}

// Reads the Session being dragged and the gesture it carries, or nothing for a source the grid does not own.
export function readDragSource(source: DragEntry | null | undefined): DragSource | null {
  if (!source) return null;

  const { session } = source.data as Partial<SessionSourcePayload>;
  if (!session) return null;

  if (source.type === DRAG_SOURCES.move) return { kind: 'move', session };
  if (source.type === DRAG_SOURCES.resize) return { kind: 'resize', session };
  return null;
}

// Reads the slot a drag is over, or nothing when the drag is not over a slot.
export function readTimeslotTarget(target: DragEntry | null | undefined): TimeslotTargetPayload | null {
  if (!target || target.type !== DROP_TARGETS.timeslot) return null;
  return target.data as TimeslotTargetPayload;
}

function readSessionTarget(target: DragEntry | null | undefined): SessionTargetPayload | null {
  if (!target || target.type !== DROP_TARGETS.session) return null;
  return target.data as SessionTargetPayload;
}

// Turns a drag end event into the gesture it asks for, or nothing for a canceled or unmatched drag.
export function decodeGesture({ canceled, operation }: DragEndEvent): Gesture | null {
  if (canceled) return null;

  const source = readDragSource(operation.source);
  if (!source) return null;

  const timeslotTarget = readTimeslotTarget(operation.target);
  if (timeslotTarget) {
    const { trackId, timeslot } = timeslotTarget;
    if (source.kind === 'resize') return { kind: 'resize', session: source.session, end: timeslot.end };
    return { kind: 'move', session: source.session, target: { trackId, start: timeslot.start } };
  }

  const sessionTarget = readSessionTarget(operation.target);
  if (sessionTarget && source.kind === 'move') {
    return { kind: 'swap', source: source.session, target: sessionTarget.session };
  }

  return null;
}
