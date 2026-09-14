import { RestrictToWindow } from '@dnd-kit/dom/modifiers';
import { DragDropProvider, PointerSensor } from '@dnd-kit/react';
import { type CSSProperties, useMemo, useRef } from 'react';
import { useScheduleContext } from '../../context/schedule-context.tsx';
import {
  blockOf,
  type ColumnRect,
  type DayGrid,
  dateOfSlot,
  dayKeyOf,
  makeDayGrid,
  resizeWindowEnd,
  slotHeight,
} from '../../models/day-grid.ts';
import type { Gesture } from '../../models/gesture-resolution.ts';
import { resolveMove, resolveResize } from '../../models/gesture-resolution.ts';
import { useGestureStore } from '../../store/gesture-store.ts';
import { useScheduleStore, useSettings } from '../../store/schedule-store.ts';
import { Day } from './day-grid.tsx';
import { type ColumnPayload, columnRectOf, readDragSource } from './dnd.ts';
import { useConflictReport } from './use-conflict-report.ts';

// The grid of the displayed days, and the only place a drag operation is read. It extracts rectangles from the
// operation, hands them to the gesture resolution model, publishes the resolved gesture so the ghost and the
// resized block can draw it, and at the drop turns it into a Session mutation. The zoom is one custom property
// here: no pixel goes any further down.

type ScheduleGridProps = { zoomLevel: number };

// What the resolution needs from a drag operation of the library.
type Operation = {
  source: Parameters<typeof readDragSource>[0];
  target: { data: unknown; element?: Element | null } | null;
  shape: { current: { boundingRectangle: { top: number } } } | null;
};

// The own column and extension window of a resize, measured once when the gesture starts.
type ResizeStart = { grid: DayGrid; columnRect: ColumnRect; windowEnd: number };

export function ScheduleGrid({ zoomLevel }: ScheduleGridProps) {
  const { tracks, displayedDays, displayedTimes } = useSettings();
  const store = useScheduleStore();
  const gestureStore = useGestureStore();
  const { moveSession, resizeSession, swapSessions } = useScheduleContext();
  const reportConflict = useConflictReport();

  const rootRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<ResizeStart | null>(null);

  const grids = useMemo(
    () => displayedDays.map((day, index) => makeDayGrid(day, index, displayedTimes, tracks)),
    [displayedDays, displayedTimes, tracks],
  );
  const gridsByKey = useMemo(() => new Map(grids.map((grid) => [grid.dayKey, grid])), [grids]);

  // A resize stays in the Track and the day of its own Session, and may only reach the next Session of that Track.
  const startResize = (session: Parameters<typeof blockOf>[1]) => {
    const grid = gridsByKey.get(dayKeyOf(session.timeslot.start));
    const block = grid && blockOf(grid, session);
    const column = grid && rootRef.current?.querySelector(`[data-column="${grid.dayKey}:${session.trackId}"]`);
    if (!grid || !block || !column) return null;

    return {
      grid,
      columnRect: columnRectOf(column),
      windowEnd: resizeWindowEnd(grid, store.getAll(), session, block.slot),
    };
  };

  const resolve = (operation: Operation): Gesture | null => {
    const source = readDragSource(operation.source);
    const draggedTop = operation.shape?.current.boundingRectangle.top;
    if (!source || draggedTop === undefined) return null;

    if (source.kind === 'resize') {
      const started = resizeRef.current;
      if (!started) return null;
      return resolveResize({ session: source.session, draggedTop, ...started });
    }

    const column = (operation.target?.data ?? null) as ColumnPayload | null;
    const element = operation.target?.element;
    return resolveMove({
      session: source.session,
      column,
      columnRect: element ? columnRectOf(element) : null,
      grid: (column && gridsByKey.get(column.dayKey)) ?? null,
      draggedTop,
      sessions: store.getAll(),
    });
  };

  const apply = async (gesture: Gesture) => {
    const grid = gridsByKey.get(gesture.dayKey);
    if (!grid || gesture.kind === 'draft') return;

    const session = store.getSession(gesture.sessionId);
    if (!session) return;

    switch (gesture.kind) {
      case 'move':
        return reportConflict(
          await moveSession(session, { trackId: gesture.trackId, start: dateOfSlot(grid, gesture.slot) }),
        );
      case 'resize':
        return reportConflict(await resizeSession(session, dateOfSlot(grid, gesture.endSlot)));
      case 'swap': {
        const target = store.getSession(gesture.targetSessionId);
        if (target) reportConflict(await swapSessions(session, target));
        return;
      }
    }
  };

  return (
    <DragDropProvider
      sensors={[PointerSensor]}
      modifiers={[RestrictToWindow]}
      onDragStart={(event) => {
        const source = readDragSource(event.operation.source);
        if (source?.kind === 'resize') resizeRef.current = startResize(source.session);
      }}
      onDragMove={(event) => {
        gestureStore.set(resolve(event.operation));
      }}
      onDragEnd={async (event) => {
        const gesture = event.canceled ? null : resolve(event.operation);
        gestureStore.set(null);
        resizeRef.current = null;
        if (gesture) await apply(gesture);
      }}
    >
      <div
        ref={rootRef}
        className="flex max-w-full divide-x-3"
        style={{ '--slot-height': `${slotHeight(zoomLevel)}px` } as CSSProperties}
      >
        {grids.map((grid) => (
          <Day key={grid.dayKey} grid={grid} gutter={grid.dayIndex === 0} multipleDays={grids.length > 1} />
        ))}
      </div>
    </DragDropProvider>
  );
}
