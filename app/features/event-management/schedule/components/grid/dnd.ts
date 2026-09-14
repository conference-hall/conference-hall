import { type CollisionDetector, CollisionPriority, CollisionType } from '@dnd-kit/abstract';
import { Feedback } from '@dnd-kit/dom';
import type { ColumnRect } from '../../models/day-grid.ts';
import type { DragSource } from '../../models/gesture-resolution.ts';
import type { ScheduleSession } from '../schedule.types.ts';

// The vocabulary the grid shares with the drag and drop library, and the only place that vocabulary is named. What
// a drag means is decided by the gesture resolution model, from the rectangles read here.

export const DRAG_SOURCES = { move: 'move-session', resize: 'resize-session' } as const;

export const COLUMN_TYPE = 'track-column';

export type SessionPayload = { session: ScheduleSession };

export type ColumnPayload = { dayKey: number; trackId: string };

// How a (day, Track) column is named in the DOM and to the drag and drop library.
export const columnKey = (dayKey: number, trackId: string) => `${dayKey}:${trackId}`;

// The dragged block itself follows the pointer: no clone promoted over the grid, no placeholder left in its row.
export const MOVE_FEEDBACK = [Feedback.configure({ feedback: 'move', dropAnimation: null })];

type DragEntry = { type?: string | number | symbol | object; data: Record<string, unknown> };

// Reads the Session being dragged and what the drag asks of it, or nothing for a source the grid does not own.
export function readDragSource(source: DragEntry | null | undefined): DragSource | null {
  if (!source) return null;

  const { session } = source.data as Partial<SessionPayload>;
  if (!session) return null;

  if (source.type === DRAG_SOURCES.move) return { kind: 'move', session };
  if (source.type === DRAG_SOURCES.resize) return { kind: 'resize', session };
  return null;
}

export function columnRectOf(element: Element): ColumnRect {
  const { top, height } = element.getBoundingClientRect();
  return { top, height };
}

// The Track column under the horizontal centre of the dragged block. Only `x` is tested: the Schedule time comes
// from the top edge of the block, resolved against the column rectangle.
export const columnUnderBlock: CollisionDetector = ({ dragOperation, droppable }) => {
  const shape = dragOperation.shape?.current;
  if (!shape || !droppable.shape) return null;

  const { left, right } = shape.boundingRectangle;
  const x = (left + right) / 2;
  const column = droppable.shape.boundingRectangle;
  if (x < column.left || x > column.right) return null;

  return { id: droppable.id, value: 1, type: CollisionType.Collision, priority: CollisionPriority.Normal };
};
