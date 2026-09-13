import { addMinutes } from 'date-fns';
import type { TimeSlot } from '~/shared/datetimes/timeslots.ts';
import { getDailyTimeSlots, haveSameStartDate, isTimeSlotIncluded } from '~/shared/datetimes/timeslots.ts';
import type { ScheduleSession, Track } from '../components/schedule.types.ts';
import { SessionMutations } from './session-mutation.ts';
import { SessionPlacement } from './session-placement.ts';

// Owns every decision the grid of one displayed day makes: its hour rows and slots, what a slot shows and
// allows, which Session occupies a slot, whether a slot accepts a drag source, what a resize preview shows,
// and how far a Session draft may be extended. It owns no pixel and never imports the drag-and-drop library.

const HOUR_INTERVAL = 60; // minutes
export const SLOT_INTERVAL = 5; // minutes

// Id given to a draft while the placement rule computes its extension window: a draft is not a Session yet.
const DRAFT_SESSION_ID = 'session-draft';

// Type identifiers registered with the drag-and-drop library, read back by the gesture decoder.
export const DRAG_SOURCES = { move: 'move-session', resize: 'resize-session' } as const;
export const DROP_TARGETS = { timeslot: 'timeslot-drop', session: 'session-drop' } as const;

// Payloads carried by the draggables and droppables of the grid
export type SessionPayload = { session: ScheduleSession };
export type GridTarget = { trackId: string; timeslot: TimeSlot };

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

// A draft session being drawn over the free slots until the pointer is released.
export type SessionDraft = { trackId: string; timeslot: TimeSlot };
export type DraftWindow = { trackId: string; timeslot: TimeSlot };

export type GridRow = { hour: TimeSlot; slots: Array<TimeSlot> };

// How a slot stands to the draft being drawn. A slot 'inside' the draft, and its 'start' slot, also extend it.
export type DraftRelation = 'none' | 'extendable' | 'inside' | 'start';

// Everything a slot shows and allows, in one value.
export type SlotView = {
  isOccupied: boolean;
  isHourStart: boolean;
  sessionBlock?: ScheduleSession;
  canStartDraft: boolean;
  draftRelation: DraftRelation;
  draftBlock?: ScheduleSession;
};

type ScheduleGridInput = {
  day: Date;
  displayedTimes: { start: number; end: number };
  tracks: Array<Track>;
  sessions: Array<ScheduleSession>;
};

export class ScheduleGrid {
  private placement: SessionPlacement;
  private gridRows?: Array<GridRow>;
  private lastDraftWindow?: { draft: SessionDraft; window: DraftWindow };

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

  // What a slot shows and allows, for a target and the draft being drawn if there is one.
  slotView(target: GridTarget, draft: SessionDraft | null): SlotView {
    const session = this.sessionAt(target);
    const draftRelation = this.draftRelation(target, draft);

    return {
      isOccupied: session !== undefined,
      isHourStart: target.timeslot.start.getMinutes() === 0,
      sessionBlock: this.isSessionStart(target) ? session : undefined,
      canStartDraft: session === undefined && draft === null,
      draftRelation,
      draftBlock: draft && draftRelation === 'start' ? SessionMutations.blank(draft) : undefined,
    };
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

  // A free slot accepts any source. An occupied slot accepts a resize from any Session, and a move only from the Session occupying it.
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

  // The time slot a Session shows while its resize pointer is over a slot. Nothing when the slot is occupied by another Session.
  resizePreview(session: ScheduleSession, target: GridTarget): TimeSlot | undefined {
    const occupying = this.sessionAt(target);
    if (occupying && occupying.id !== session.id) return undefined;
    return { start: session.timeslot.start, end: target.timeslot.end };
  }

  // The window a draft may be extended into. Kept for the draft it was computed from: every slot of the day
  // asks for it during a drawing.
  draftWindow(draft: SessionDraft): DraftWindow {
    if (this.lastDraftWindow?.draft === draft) return this.lastDraftWindow.window;

    const outcome = this.placement.resize({ id: DRAFT_SESSION_ID, ...draft }, this.displayedEnd);
    const window =
      outcome.status === 'conflict' ? draft : { trackId: draft.trackId, timeslot: outcome.placement.timeslot };

    this.lastDraftWindow = { draft, window };
    return window;
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

  private draftRelation(target: GridTarget, draft: SessionDraft | null): DraftRelation {
    if (!draft) return 'none';
    if (target.trackId === draft.trackId && haveSameStartDate(target.timeslot, draft.timeslot)) return 'start';
    if (this.isInsideDraft(draft, target)) return 'inside';
    if (this.canExtendDraft(this.draftWindow(draft), target)) return 'extendable';
    return 'none';
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

  const { session } = source.data as Partial<SessionPayload>;
  if (!session) return null;

  if (source.type === DRAG_SOURCES.move) return { kind: 'move', session };
  if (source.type === DRAG_SOURCES.resize) return { kind: 'resize', session };
  return null;
}

// Reads the slot a drag is over, or nothing when the drag is not over a slot.
export function readTimeslotTarget(target: DragEntry | null | undefined): GridTarget | null {
  if (!target || target.type !== DROP_TARGETS.timeslot) return null;
  return target.data as GridTarget;
}

function readSessionTarget(target: DragEntry | null | undefined): SessionPayload | null {
  if (!target || target.type !== DROP_TARGETS.session) return null;
  return target.data as SessionPayload;
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
