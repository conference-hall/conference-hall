import type { ScheduleSession } from '../components/schedule.types.ts';
import { blockOf, type ColumnRect, type DayGrid, dateOfSlot, sessionAt, slotAtY } from './day-grid.ts';

// Owns what a pointer gesture on the Schedule designates: from the dragged Session, the Track column under it and
// the top edge of the dragged element, it decides whether the gesture moves a Session, swaps it with the one it
// lands on, or resizes it, and on which slot. It reads rectangles as plain numbers and never touches the DOM nor
// the drag-and-drop library.

// The Session being dragged and what the drag asks of it.
export type DragSource = { kind: 'move' | 'resize'; session: ScheduleSession };

// The (day, Track) column a drag is over.
export type ColumnTarget = { dayKey: number; trackId: string };

// The live gesture and its target, as the gesture store holds it. Slots are day-relative.
export type Gesture =
  | { kind: 'move'; sessionId: string; dayKey: number; trackId: string; slot: number }
  | {
      kind: 'swap';
      sessionId: string;
      targetSessionId: string;
      dayKey: number;
      trackId: string;
      slot: number;
      span: number;
    }
  | { kind: 'resize'; sessionId: string; dayKey: number; trackId: string; slot: number; endSlot: number }
  | { kind: 'draft'; dayKey: number; trackId: string; slot: number; endSlot: number };

type MoveInput = {
  session: ScheduleSession;
  column: ColumnTarget | null;
  columnRect: ColumnRect | null;
  grid: DayGrid | null;
  draggedTop: number;
  sessions: Array<ScheduleSession>;
};

// What a move asks for: the Track column under the dragged block and the slot under its top edge. Landing on a
// slot covered by another Session makes it a swap. No target outside the columns, and none on a slot covered by a
// Session the displayed day does not draw.
export function resolveMove({ session, column, columnRect, grid, draggedTop, sessions }: MoveInput): Gesture | null {
  if (!column || !columnRect || !grid) return null;

  const slot = slotAtY(grid, columnRect, draggedTop);
  const occupying = sessionAt(sessions, column.trackId, dateOfSlot(grid, slot));

  if (occupying && occupying.id !== session.id) {
    const block = blockOf(grid, occupying);
    if (!block) return null;
    return {
      kind: 'swap',
      sessionId: session.id,
      targetSessionId: occupying.id,
      dayKey: grid.dayKey,
      trackId: column.trackId,
      slot: block.slot,
      span: block.span,
    };
  }

  return { kind: 'move', sessionId: session.id, dayKey: grid.dayKey, trackId: column.trackId, slot };
}

type ResizeInput = {
  session: ScheduleSession;
  columnRect: ColumnRect | null;
  grid: DayGrid | null;
  draggedTop: number;
  windowEnd: number;
};

// What a resize asks for: its own Track and day, whatever column the handle is over, and the slot under the top
// edge of the handle, clamped between one slot and the extension window computed at the start of the gesture.
export function resolveResize({ session, columnRect, grid, draggedTop, windowEnd }: ResizeInput): Gesture | null {
  if (!columnRect || !grid) return null;

  const block = blockOf(grid, session);
  if (!block) return null;

  const slot = slotAtY(grid, columnRect, draggedTop);
  const endSlot = Math.max(block.slot + 1, Math.min(windowEnd, slot + 1));

  return {
    kind: 'resize',
    sessionId: session.id,
    dayKey: grid.dayKey,
    trackId: session.trackId,
    slot: block.slot,
    endSlot,
  };
}
