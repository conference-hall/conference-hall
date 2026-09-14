import { useDroppable } from '@dnd-kit/react';
import { type CSSProperties, memo, type PointerEvent, useRef } from 'react';
import { useScheduleContext } from '../../context/schedule-context.tsx';
import { type DayGrid, dateOfSlot, draftWindowEnd, sessionAt, slotAtY } from '../../models/day-grid.ts';
import { SessionMutations } from '../../models/session-mutation.ts';
import { useGestureStore } from '../../store/gesture-store.ts';
import { useScheduleStore } from '../../store/schedule-store.ts';
import type { Track } from '../schedule.types.ts';
import { columnRectOf, COLUMN_TYPE, type ColumnPayload, columnUnderBlock, readDragSource } from './dnd.ts';
import { useConflictReport } from './use-conflict-report.ts';

// A draft grows downwards only, from one slot to the last one before the next Session of its Track.
type Draft = { startSlot: number; windowEnd: number };

const extendedTo = (draft: Draft, slot: number) => Math.max(draft.startSlot + 1, Math.min(draft.windowEnd, slot + 1));

type TrackColumnProps = {
  grid: DayGrid;
  track: Track;
  colIndex: number;
  className?: string;
  style?: CSSProperties;
};

// One Track column of one displayed day: the single drop target of the column, whatever the slot, and the surface
// a Session draft is drawn on. It renders no slot element and subscribes to nothing, so it never re-renders.
export const TrackColumn = memo(function TrackColumn({ grid, track, colIndex, className, style }: TrackColumnProps) {
  const store = useScheduleStore();
  const gestureStore = useGestureStore();
  const { addSession } = useScheduleContext();
  const reportConflict = useConflictReport();

  const { ref: columnRef } = useDroppable({
    id: `column:${grid.dayKey}:${track.id}`,
    type: COLUMN_TYPE,
    data: { dayKey: grid.dayKey, trackId: track.id } satisfies ColumnPayload,
    accept: (source) => readDragSource(source) !== null,
    collisionDetector: columnUnderBlock,
  });

  const draftRef = useRef<Draft | null>(null);

  const slotUnder = (event: PointerEvent<HTMLDivElement>) =>
    slotAtY(grid, columnRectOf(event.currentTarget), event.clientY);

  // A draft starts on a free slot and captures the pointer: it is then extended and released wherever the pointer
  // goes, and it never leaves its Track.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    const slot = slotUnder(event);
    if (sessionAt(store.getAll(), track.id, dateOfSlot(grid, slot))) return;

    const windowEnd = draftWindowEnd(grid, store.getAll(), track.id, slot);
    draftRef.current = { startSlot: slot, windowEnd };
    event.currentTarget.setPointerCapture(event.pointerId);
    gestureStore.set({ kind: 'draft', dayKey: grid.dayKey, trackId: track.id, slot, endSlot: slot + 1 });
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const draft = draftRef.current;
    if (!draft) return;

    gestureStore.set({
      kind: 'draft',
      dayKey: grid.dayKey,
      trackId: track.id,
      slot: draft.startSlot,
      endSlot: extendedTo(draft, slotUnder(event)),
    });
  };

  // The release decides the end of the draft, wherever the pointer is: the browser may have coalesced away the
  // last moves, and a plain click creates a five-minute Session.
  const onPointerUp = async (event: PointerEvent<HTMLDivElement>) => {
    const draft = draftRef.current;
    if (!draft) return;
    draftRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);

    const endSlot = extendedTo(draft, slotUnder(event));
    gestureStore.set(null);

    const timeslot = { start: dateOfSlot(grid, draft.startSlot), end: dateOfSlot(grid, endSlot) };
    reportConflict(await addSession(SessionMutations.blank({ trackId: track.id, timeslot })));
  };

  const onPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (!draftRef.current) return;
    draftRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    gestureStore.set(null);
  };

  return (
    <div
      ref={columnRef}
      data-column={`${grid.dayKey}:${track.id}`}
      data-column-index={colIndex}
      aria-label={track.name}
      className={className}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    />
  );
});
