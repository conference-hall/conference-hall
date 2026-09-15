import { type CollisionDetector, CollisionPriority, CollisionType } from '@dnd-kit/abstract';
import type { ColumnRect } from '../../models/day-grid.ts';
import type { DragSource } from '../../models/gesture-resolution.ts';
import type { ScheduleSession } from '../schedule.types.ts';

export const DRAG_SOURCES = { move: 'move-session', resize: 'resize-session' } as const;

export const COLUMN_TYPE = 'track-column';

export type SessionPayload = { session: ScheduleSession };

export type ColumnPayload = { dayKey: number; trackId: string };

// Generates a unique key for a column in the grid.
export const columnKey = (dayKey: number, trackId: string) => `${dayKey}:${trackId}`;

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

// Detects the Track column under the horizontal centre of the dragged block.
export const columnUnderBlock: CollisionDetector = ({ dragOperation, droppable }) => {
  const shape = dragOperation.shape?.current;
  if (!shape || !droppable.shape) return null;

  const { left, right } = shape.boundingRectangle;
  const x = (left + right) / 2;
  const column = droppable.shape.boundingRectangle;
  if (x < column.left || x > column.right) return null;

  return { id: droppable.id, value: 1, type: CollisionType.Collision, priority: CollisionPriority.Normal };
};
