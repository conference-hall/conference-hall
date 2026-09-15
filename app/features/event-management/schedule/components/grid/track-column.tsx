import { useDroppable } from '@dnd-kit/react';
import { type CSSProperties, memo, type PointerEvent, useRef } from 'react';
import { useScheduleContext } from '../../context/schedule-context.tsx';
import {
  type DayGrid,
  dateOfSlot,
  extendedEndSlot,
  resizeWindowEnd,
  sessionAt,
  slotAtY,
} from '../../models/day-grid.ts';
import { SessionMutations } from '../../models/session-mutation.ts';
import { useGestureStore } from '../../store/gesture-store.ts';
import { useScheduleStore } from '../../store/schedule-store.ts';
import type { Track } from '../schedule.types.ts';
import { columnKey, columnRectOf, COLUMN_TYPE, type ColumnPayload, columnUnderBlock, readDragSource } from './dnd.ts';
import { useConflictReport } from './use-conflict-report.ts';

type Draft = { startSlot: number; windowEnd: number };

type TrackColumnProps = {
  grid: DayGrid;
  track: Track;
  colIndex: number;
  className?: string;
  style?: CSSProperties;
};

export const TrackColumn = memo(function TrackColumn({ grid, track, colIndex, className, style }: TrackColumnProps) {
  const store = useScheduleStore();
  const gestureStore = useGestureStore();
  const { addSession } = useScheduleContext();
  const reportConflict = useConflictReport();

  const { ref: columnRef } = useDroppable({
    id: `column:${columnKey(grid.dayKey, track.id)}`,
    type: COLUMN_TYPE,
    data: { dayKey: grid.dayKey, trackId: track.id } satisfies ColumnPayload,
    accept: (source) => readDragSource(source) !== null,
    collisionDetector: columnUnderBlock,
  });

  const draftRef = useRef<Draft | null>(null);

  const slotUnder = (event: PointerEvent<HTMLDivElement>) =>
    slotAtY(grid, columnRectOf(event.currentTarget), event.clientY);

  const handleDraftSessionStart = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    const slot = slotUnder(event);
    if (sessionAt(store.getAll(), track.id, dateOfSlot(grid, slot))) return;

    const windowEnd = resizeWindowEnd(grid, store.getAll(), 'session-draft', track.id, slot);
    draftRef.current = { startSlot: slot, windowEnd };
    event.currentTarget.setPointerCapture(event.pointerId);
    gestureStore.set({ kind: 'draft', dayKey: grid.dayKey, trackId: track.id, slot, endSlot: slot + 1 });
  };

  const handleDraftSessionResize = (event: PointerEvent<HTMLDivElement>) => {
    const draft = draftRef.current;
    if (!draft) return;

    gestureStore.set({
      kind: 'draft',
      dayKey: grid.dayKey,
      trackId: track.id,
      slot: draft.startSlot,
      endSlot: extendedEndSlot(draft.startSlot, draft.windowEnd, slotUnder(event)),
    });
  };

  const handleDraftSessionEnd = async (event: PointerEvent<HTMLDivElement>) => {
    const draft = draftRef.current;
    if (!draft) return;
    draftRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);

    const endSlot = extendedEndSlot(draft.startSlot, draft.windowEnd, slotUnder(event));
    gestureStore.set(null);

    const timeslot = { start: dateOfSlot(grid, draft.startSlot), end: dateOfSlot(grid, endSlot) };
    reportConflict(await addSession(SessionMutations.blank({ trackId: track.id, timeslot })));
  };

  const handleDraftSessionCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (!draftRef.current) return;
    draftRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    gestureStore.set(null);
  };

  return (
    <div
      ref={columnRef}
      data-column={columnKey(grid.dayKey, track.id)}
      data-column-index={colIndex}
      role="group"
      aria-label={track.name}
      className={className}
      style={style}
      onPointerDown={handleDraftSessionStart}
      onPointerMove={handleDraftSessionResize}
      onPointerUp={handleDraftSessionEnd}
      onPointerCancel={handleDraftSessionCancel}
    />
  );
});
