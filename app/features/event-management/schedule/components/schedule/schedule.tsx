// `useDroppable` and `useDraggable` expose callback refs (`droppable.ref`, `movable.ref`) alongside plain state
// (`isDropTarget`, `isDragging`), none of which read `.current` during render.
// oxlint-disable react/refs
import { RestrictToWindow } from '@dnd-kit/dom/modifiers';
import { DragDropProvider, PointerSensor, useDragDropMonitor, useDraggable, useDroppable } from '@dnd-kit/react';
import { cx } from 'class-variance-authority';
import type { RefObject } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { toDateInput } from '~/shared/datetimes/datetimes.ts';
import { deepEqual } from '~/shared/utils/deep-equal.ts';
import type { GridTarget, SessionDraft, SessionPayload, SlotView } from '../../models/schedule-grid.ts';
import {
  decodeGesture,
  DRAG_SOURCES,
  DROP_TARGETS,
  readDragSource,
  readTimeslotTarget,
  ScheduleGrid,
  SLOT_INTERVAL,
} from '../../models/schedule-grid.ts';
import { SessionMutations } from '../../models/session-mutation.ts';
import type { PlacementOutcome, SwapOutcome } from '../../models/session-placement.ts';
import { useCurrentSchedule, useScheduleSessions } from '../../schedule-context.tsx';
import type { ScheduleSession } from '../schedule.types.ts';
import { SessionBlock } from '../session/session-block.tsx';
import { getSessionHeight, getTimeslotHeight, topInsideDroppable } from './helpers.ts';

type ScheduleProps = { zoomLevel: number };

export default function Schedule({ zoomLevel }: ScheduleProps) {
  const { displayedDays, moveSession, resizeSession, swapSessions } = useCurrentSchedule();
  const reportConflict = useConflictReport();

  return (
    <DragDropProvider
      sensors={[PointerSensor]}
      modifiers={[RestrictToWindow]}
      onDragEnd={async (event) => {
        const gesture = decodeGesture(event);
        if (!gesture) return;

        switch (gesture.kind) {
          case 'move':
            return reportConflict(await moveSession(gesture.session, gesture.target));
          case 'resize':
            return reportConflict(await resizeSession(gesture.session, gesture.end));
          case 'swap':
            return reportConflict(await swapSessions(gesture.source, gesture.target));
        }
      }}
    >
      <div className="flex max-w-full divide-x-3">
        {displayedDays.map((day, index) => (
          <ScheduleDay
            key={toDateInput(day)}
            day={day}
            dayIndex={index}
            zoomLevel={zoomLevel}
            displayMultipleDays={displayedDays.length > 1}
          />
        ))}
      </div>
    </DragDropProvider>
  );
}

// Shows the Schedule conflict message when a gesture is refused by the placement rule.
function useConflictReport() {
  const { t } = useTranslation();
  return useCallback(
    (outcome: PlacementOutcome | SwapOutcome) => {
      if (outcome.status !== 'conflict') return;
      toast.error(t('event-management.schedule.errors.session-conflict'));
    },
    [t],
  );
}

// The phases of a drawing gesture, all served by one stable callback.
type DraftPhase = 'start' | 'extend' | 'end';
type DraftHandler = (target: GridTarget, phase: DraftPhase) => void;

type ScheduleDayProps = {
  day: Date;
  dayIndex: number;
  zoomLevel: number;
  displayMultipleDays: boolean;
};

function ScheduleDay({ day, dayIndex, zoomLevel, displayMultipleDays }: ScheduleDayProps) {
  const { scheduleTime, displayedTimes, tracks, addSession } = useCurrentSchedule();
  // The only reader of the drawn Sessions: the day rebuilds its model on every mutation, nothing above it re-renders.
  const sessions = useScheduleSessions();
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const reportConflict = useConflictReport();

  const grid = useMemo(
    () => new ScheduleGrid({ day, displayedTimes, tracks, sessions }),
    [day, displayedTimes, tracks, sessions],
  );

  // Slots read the model from a ref, and only in drag callbacks: a Session mutation rebuilds the model, and
  // comparing it in the memo would re-render every slot of the day on every mutation.
  const gridRef = useRef(grid);
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  const [draft, setDraft] = useState<SessionDraft | null>(null);

  // The draft is also held in a ref: the single draft callback stays stable across renders and reads the draft
  // drawn so far at the moment of the gesture, never through a closure a memoized slot could keep stale.
  const draftRef = useRef<SessionDraft | null>(null);

  const handleDraft = useCallback(
    async (target: GridTarget, phase: DraftPhase) => {
      if (phase === 'start') {
        draftRef.current = target;
        return setDraft(target);
      }

      const current = draftRef.current;
      if (!current) return;
      const drawn = { ...current, timeslot: { ...current.timeslot, end: target.timeslot.end } };

      if (phase === 'extend') {
        draftRef.current = drawn;
        return setDraft(drawn);
      }

      draftRef.current = null;
      setDraft(null);
      reportConflict(await addSession(SessionMutations.blank(drawn)));
    },
    [addSession, reportConflict],
  );

  return (
    <div className={cx('w-full bg-white', { 'select-none': draft !== null })}>
      <table className="w-full table-fixed border-separate border-spacing-0">
        {/* header */}
        <thead className="sticky top-[64px] z-30 bg-white shadow-sm">
          {displayMultipleDays && (
            <tr className="h-8">
              {/* gutter */}
              {dayIndex === 0 && <th className="w-12 border-b" aria-hidden />}
              {/* day */}
              <th className="border-b text-sm font-semibold" colSpan={grid.tracks.length}>
                {scheduleTime.formatDate(day, locale)}
              </th>
            </tr>
          )}
          <tr className={cx('divide-x', { 'h-12': !displayMultipleDays, 'h-8': displayMultipleDays })}>
            {/* gutter */}
            {dayIndex === 0 && (
              <th className="w-12 bg-white text-center text-xs font-normal text-gray-400">
                {scheduleTime.gmtOffset(day, locale)}
              </th>
            )}
            {/* tracks header */}
            {grid.tracks.map((track) => (
              <th key={track.id} className="px-2 text-sm font-semibold text-gray-900">
                <div className="truncate" title={track.name}>
                  {track.name}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* content */}
        <tbody>
          {/* empty line */}
          <tr className="divide-x">
            {dayIndex === 0 && <td className="h-6 w-12" aria-hidden />}
            {grid.tracks.map((track) => (
              <td key={track.id} className="h-6" aria-label={track.name} />
            ))}
          </tr>

          {/* rows by hours */}
          {grid.rows.map(({ hour, slots }) => {
            const startHour = scheduleTime.formatTime(hour.start, locale);
            const endHour = scheduleTime.formatTime(hour.end, locale);

            return (
              <tr key={`${startHour}-${endHour}`} className="divide-x">
                {/* gutter */}
                {dayIndex === 0 && (
                  <td className="relative text-xs whitespace-nowrap text-gray-500">
                    <time className="absolute -top-2 right-2" dateTime={startHour}>
                      {startHour}
                    </time>
                  </td>
                )}

                {/* rows by track */}
                {grid.tracks.map((track) => (
                  <td key={track.id} className="p-0">
                    {slots.map((timeslot) => {
                      const target = { trackId: track.id, timeslot };

                      return (
                        <MemoizedTimeslot
                          key={`${track.id}-${timeslot.start.toISOString()}`}
                          gridRef={gridRef}
                          target={target}
                          view={grid.slotView(target, draft)}
                          zoomLevel={zoomLevel}
                          onDraft={handleDraft}
                        />
                      );
                    })}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Memoized Timeslot component: only the slots whose own view changed re-render, on a drawing as on a mutation.
// The view is compared by value: the Sessions are rebuilt on every mutation and on every server response.
// The Schedule itself is read from the context, so every prop is compared here.
const MemoizedTimeslot = React.memo(Timeslot, (prevProps, nextProps) => {
  return (
    prevProps.gridRef === nextProps.gridRef &&
    prevProps.target.trackId === nextProps.target.trackId &&
    prevProps.target.timeslot.start.getTime() === nextProps.target.timeslot.start.getTime() &&
    prevProps.zoomLevel === nextProps.zoomLevel &&
    prevProps.onDraft === nextProps.onDraft &&
    deepEqual(prevProps.view, nextProps.view)
  );
});

type TimeslotProps = {
  gridRef: RefObject<ScheduleGrid>;
  target: GridTarget;
  view: SlotView;
  zoomLevel: number;
  onDraft: DraftHandler;
};

function Timeslot({ gridRef, target, view, zoomLevel, onDraft }: TimeslotProps) {
  const { scheduleTime } = useCurrentSchedule();
  const { i18n } = useTranslation();
  const { trackId, timeslot } = target;
  const { isOccupied, isHourStart, sessionBlock, canStartDraft, draftRelation, draftBlock } = view;
  const label = `Timeslot ${scheduleTime.formatTime(timeslot.start, i18n.language)}`;

  // droppable timeslot
  const droppable = useDroppable({
    id: `${trackId}-${timeslot.start.toISOString()}`,
    type: DROP_TARGETS.timeslot,
    data: target satisfies GridTarget,
    accept: (source) => gridRef.current.acceptsDropOnSlot(target, readDragSource(source)),
    collisionDetector: topInsideDroppable,
  });

  const extendsDraft = draftRelation !== 'none';
  const isCoveredByDraft = draftRelation === 'inside' || draftRelation === 'start';

  return (
    <div
      ref={droppable.ref}
      role="button"
      tabIndex={0}
      aria-label={label}
      onMouseDown={canStartDraft ? () => onDraft(target, 'start') : undefined}
      onMouseEnter={extendsDraft ? () => onDraft(target, 'extend') : undefined}
      onMouseUp={extendsDraft ? () => onDraft(target, 'end') : undefined}
      style={{ height: `${getTimeslotHeight(zoomLevel)}px` }}
      className={cx('relative', {
        'z-10': !isOccupied,
        'bg-blue-200': droppable.isDropTarget,
        'hover:bg-gray-50': canStartDraft,
        "before:absolute before:top-0 before:right-0 before:left-0 before:border-t before:content-['']":
          isHourStart && !droppable.isDropTarget && !isCoveredByDraft,
      })}
    >
      {/* invisible span to have content for the table */}
      <span className="invisible">{label}</span>

      {sessionBlock ? (
        // displayed session block
        <SessionWrapper
          key={`${sessionBlock.id}-${sessionBlock.timeslot.start.toISOString()}-${sessionBlock.timeslot.end.toISOString()}-${zoomLevel}`}
          gridRef={gridRef}
          session={sessionBlock}
          zoomLevel={zoomLevel}
        />
      ) : draftBlock ? (
        // session draft being drawn
        <SessionWrapper
          key={`draft-${draftBlock.timeslot.end.toISOString()}`}
          gridRef={gridRef}
          session={draftBlock}
          zoomLevel={zoomLevel}
        />
      ) : null}
    </div>
  );
}

type SessionWrapperProps = {
  gridRef: RefObject<ScheduleGrid>;
  session: ScheduleSession;
  zoomLevel: number;
};

function SessionWrapper({ gridRef, session, zoomLevel }: SessionWrapperProps) {
  const { onOpenSession } = useCurrentSchedule();
  // Compute session height
  const defaultHeight = getSessionHeight(session, SLOT_INTERVAL, zoomLevel);
  const [height, setHeight] = useState(defaultHeight);

  // update height on session resize
  useDragDropMonitor({
    onDragMove: ({ operation }) => {
      const source = readDragSource(operation.source);
      if (source?.kind !== 'resize' || source.session.id !== session.id) return;

      const target = readTimeslotTarget(operation.target);
      if (!target) return;

      const preview = gridRef.current.resizePreview(session, target);
      if (!preview) return;

      setHeight(getSessionHeight({ ...session, timeslot: preview }, SLOT_INTERVAL, zoomLevel));
    },
  });

  // draggable to move session
  const movable = useDraggable({
    id: `move:${session.id}`,
    type: DRAG_SOURCES.move,
    data: { session } satisfies SessionPayload,
    disabled: session.isCreating,
  });

  // draggable to resize session
  const resizable = useDraggable({
    id: `resize:${session.id}`,
    type: DRAG_SOURCES.resize,
    data: { session } satisfies SessionPayload,
    disabled: session.isCreating,
  });

  // droppable to swap sessions
  const droppable = useDroppable({
    id: `drop:${session.id}`,
    type: DROP_TARGETS.session,
    data: { session } satisfies SessionPayload,
    accept: (source) => gridRef.current.acceptsDropOnSession(session, readDragSource(source)),
    collisionDetector: topInsideDroppable,
  });

  return (
    <>
      {/* session position & handler */}
      <div
        ref={movable.ref}
        className={cx('absolute z-20 overflow-hidden', {
          'rounded-md ring-1 ring-blue-600': droppable.isDropTarget,
          'shadow-lg': movable.isDragging,
        })}
        style={{ top: '0px', left: '1px', right: '1px', zIndex: movable.isDragging ? '40' : undefined }}
      >
        <div ref={droppable.ref} style={{ height: `${height}px` }}>
          <SessionBlock session={session} height={height} onOpen={() => onOpenSession(session)} />
        </div>
      </div>

      {/* resize handler */}
      <div
        ref={resizable.ref}
        style={{ top: `${height}px` }}
        className="absolute -bottom-1 z-40 h-1 w-full cursor-ns-resize"
      />
    </>
  );
}
