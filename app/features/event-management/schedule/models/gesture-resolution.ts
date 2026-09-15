import type { ScheduleSession } from '../components/schedule.types.ts';
import { blockOf, type ColumnRect, type DayGrid, dateOfSlot, extendedEndSlot, sessionAt, slotAtY } from './day-grid.ts';

// The Session being dragged and what the drag asks of it.
export type DragSource = { kind: 'move' | 'resize'; session: ScheduleSession };

// The live gesture and its target, as the gesture store holds it.
export type Gesture =
  | {
      kind: 'move';
      sessionId: string;
      dayKey: number;
      trackId: string;
      slot: number;
    }
  | {
      kind: 'swap';
      sessionId: string;
      targetSessionId: string;
      dayKey: number;
      trackId: string;
      slot: number;
      span: number;
    }
  | {
      kind: 'resize';
      sessionId: string;
      dayKey: number;
      trackId: string;
      slot: number;
      endSlot: number;
    }
  | {
      kind: 'draft';
      dayKey: number;
      trackId: string;
      slot: number;
      endSlot: number;
    };

type MoveInput = {
  session: ScheduleSession;
  column: { dayKey: number; trackId: string } | null;
  columnRect: ColumnRect | null;
  grid: DayGrid | null;
  draggedTop: number;
  sessions: Array<ScheduleSession>;
};

// Resolves a move gesture to a gesture action, including swap if the target slot is covered by another Session.
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

  return {
    kind: 'move',
    sessionId: session.id,
    dayKey: grid.dayKey,
    trackId: column.trackId,
    slot,
  };
}

type ResizeInput = {
  session: ScheduleSession;
  columnRect: ColumnRect | null;
  grid: DayGrid | null;
  draggedTop: number;
  windowEnd: number;
};

// Resolves a resize gesture to a gesture action, including the end slot of the resize window.
export function resolveResize({ session, columnRect, grid, draggedTop, windowEnd }: ResizeInput): Gesture | null {
  if (!columnRect || !grid) return null;

  const block = blockOf(grid, session);
  if (!block) return null;

  const endSlot = extendedEndSlot(block.slot, windowEnd, slotAtY(grid, columnRect, draggedTop));

  return {
    kind: 'resize',
    sessionId: session.id,
    dayKey: grid.dayKey,
    trackId: session.trackId,
    slot: block.slot,
    endSlot,
  };
}
