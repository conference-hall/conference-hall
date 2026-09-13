// `useDroppable` and `useDraggable` expose callback refs (`droppable.ref`, `movable.ref`) alongside plain state
// (`isDropTarget`, `isDragging`), none of which read `.current` during render.
// oxlint-disable react/refs
import { RestrictToWindow } from '@dnd-kit/dom/modifiers';
import { DragDropProvider, PointerSensor, useDragDropMonitor, useDraggable, useDroppable } from '@dnd-kit/react';
import { cx } from 'class-variance-authority';
import type { ReactNode, RefObject } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { toDateInput } from '~/shared/datetimes/datetimes.ts';
import type { TimeSlot } from '~/shared/datetimes/timeslots.ts';
import { haveSameStartDate } from '~/shared/datetimes/timeslots.ts';
import type { GridTarget, SessionDraft, SessionPayload } from '../../models/schedule-grid.ts';
import {
  decodeGesture,
  DRAG_SOURCES,
  DROP_TARGETS,
  readDragSource,
  readTimeslotTarget,
  ScheduleGrid,
  SLOT_INTERVAL,
} from '../../models/schedule-grid.ts';
import type { ScheduleTime } from '../../models/schedule-time.ts';
import type { PlacementOutcome, SwapOutcome } from '../../models/session-placement.ts';
import type { ScheduleSession, Track } from '../schedule.types.ts';
import { getSessionHeight, getTimeslotHeight, topInsideDroppable } from './helpers.ts';

type ScheduleProps = {
  displayedDays: Array<Date>;
  displayedTimes: { start: number; end: number };
  scheduleTime: ScheduleTime;
  tracks: Array<Track>;
  sessions: Array<ScheduleSession>;
  renderSession: (session: ScheduleSession, height: number) => ReactNode;
  onAddSession: (session: Omit<ScheduleSession, 'id' | 'isCreating'>) => Promise<PlacementOutcome>;
  onMoveSession: (session: ScheduleSession, target: { trackId: string; start: Date }) => Promise<PlacementOutcome>;
  onResizeSession: (session: ScheduleSession, end: Date) => Promise<PlacementOutcome>;
  onSwapSessions: (source: ScheduleSession, target: ScheduleSession) => Promise<SwapOutcome>;
  zoomLevel: number;
};

export default function Schedule({
  displayedDays,
  displayedTimes,
  scheduleTime,
  tracks = [],
  sessions = [],
  renderSession,
  onAddSession,
  onMoveSession,
  onResizeSession,
  onSwapSessions,
  zoomLevel,
}: ScheduleProps) {
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
            return reportConflict(await onMoveSession(gesture.session, gesture.target));
          case 'resize':
            return reportConflict(await onResizeSession(gesture.session, gesture.end));
          case 'swap':
            return reportConflict(await onSwapSessions(gesture.source, gesture.target));
        }
      }}
    >
      <div className="flex max-w-full divide-x-3">
        {displayedDays.map((day, index) => (
          <ScheduleDay
            key={toDateInput(day)}
            day={day}
            dayIndex={index}
            displayedTimes={displayedTimes}
            scheduleTime={scheduleTime}
            tracks={tracks}
            sessions={sessions}
            renderSession={renderSession}
            onAddSession={onAddSession}
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

// A draft becomes a Session only to render its block and to add it through the hook.
function toDraftSession({ trackId, timeslot }: SessionDraft): ScheduleSession {
  return { id: 'new', trackId, timeslot, color: 'stone', emojis: [], language: null };
}

type ScheduleDayProps = {
  day: Date;
  dayIndex: number;
  scheduleTime: ScheduleTime;
  displayedTimes: { start: number; end: number };
  tracks: Array<Track>;
  sessions: Array<ScheduleSession>;
  renderSession: (session: ScheduleSession, height: number) => ReactNode;
  onAddSession: (session: Omit<ScheduleSession, 'id' | 'isCreating'>) => Promise<PlacementOutcome>;
  zoomLevel: number;
  displayMultipleDays: boolean;
};

function ScheduleDay({
  day,
  dayIndex,
  scheduleTime,
  displayedTimes,
  tracks,
  sessions,
  renderSession,
  onAddSession,
  zoomLevel,
  displayMultipleDays,
}: ScheduleDayProps) {
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
  const draftWindow = draft ? grid.draftWindow(draft) : null;

  // The released slot carries the end of the Session: a slot skipped by a fast pointer move holds an older draft.
  const handleCreateDraft = useCallback(
    async (end: Date) => {
      if (!draft) return;
      setDraft(null);
      reportConflict(await onAddSession(toDraftSession({ ...draft, timeslot: { ...draft.timeslot, end } })));
    },
    [draft, onAddSession, reportConflict],
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
                {scheduleTime.gmtOffset(locale)}
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
                    {slots.map((timeslot, index) => {
                      const target = { trackId: track.id, timeslot };
                      const session = grid.sessionAt(target);
                      const canExtendDraft = draftWindow !== null && grid.canExtendDraft(draftWindow, target);
                      const isDraftStart =
                        draft !== null && draft.trackId === track.id && haveSameStartDate(timeslot, draft.timeslot);

                      return (
                        <MemoizedTimeslot
                          key={`${track.id}-${timeslot.start.toISOString()}`}
                          gridRef={gridRef}
                          scheduleTime={scheduleTime}
                          trackId={track.id}
                          timeslot={timeslot}
                          isOccupied={session !== undefined}
                          sessionBlock={session && grid.isSessionStart(target) ? session : undefined}
                          zoomLevel={zoomLevel}
                          isFirstTimeslot={index === 0}
                          isDrawing={draft !== null}
                          isInsideDraft={draft !== null && grid.isInsideDraft(draft, target)}
                          canExtendDraft={canExtendDraft}
                          draftSession={isDraftStart ? toDraftSession(draft) : undefined}
                          onStartDraft={() => setDraft({ trackId: track.id, timeslot })}
                          onExtendDraft={
                            draft
                              ? () => setDraft({ ...draft, timeslot: { ...draft.timeslot, end: timeslot.end } })
                              : undefined
                          }
                          onCreateDraft={() => handleCreateDraft(timeslot.end)}
                          renderSession={renderSession}
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

// Memoized Timeslot component: only the slots whose own state changed re-render, on a drawing as on a mutation.
const MemoizedTimeslot = React.memo(Timeslot, (prevProps, nextProps) => {
  return (
    prevProps.trackId === nextProps.trackId &&
    prevProps.timeslot.start.getTime() === nextProps.timeslot.start.getTime() &&
    prevProps.isOccupied === nextProps.isOccupied &&
    prevProps.sessionBlock === nextProps.sessionBlock &&
    prevProps.zoomLevel === nextProps.zoomLevel &&
    prevProps.isFirstTimeslot === nextProps.isFirstTimeslot &&
    prevProps.isDrawing === nextProps.isDrawing &&
    prevProps.isInsideDraft === nextProps.isInsideDraft &&
    prevProps.canExtendDraft === nextProps.canExtendDraft &&
    prevProps.draftSession === nextProps.draftSession
  );
});

type TimeslotProps = {
  gridRef: RefObject<ScheduleGrid>;
  scheduleTime: ScheduleTime;
  trackId: string;
  timeslot: TimeSlot;
  isOccupied: boolean;
  sessionBlock?: ScheduleSession;
  zoomLevel: number;
  isFirstTimeslot: boolean;
  isDrawing: boolean;
  isInsideDraft: boolean;
  canExtendDraft: boolean;
  draftSession?: ScheduleSession;
  onStartDraft: () => void;
  onExtendDraft?: () => void;
  onCreateDraft: () => void;
  renderSession: (session: ScheduleSession, height: number) => ReactNode;
};

function Timeslot({
  gridRef,
  scheduleTime,
  trackId,
  timeslot,
  isOccupied,
  sessionBlock,
  zoomLevel,
  isFirstTimeslot,
  isDrawing,
  isInsideDraft,
  canExtendDraft,
  draftSession,
  onStartDraft,
  onExtendDraft,
  onCreateDraft,
  renderSession,
}: TimeslotProps) {
  const { i18n } = useTranslation();
  const label = `Timeslot ${scheduleTime.formatTime(timeslot.start, i18n.language)}`;

  // droppable timeslot
  const droppable = useDroppable({
    id: `${trackId}-${timeslot.start.toISOString()}`,
    type: DROP_TARGETS.timeslot,
    data: { trackId, timeslot } satisfies GridTarget,
    accept: (source) => gridRef.current.acceptsDropOnSlot({ trackId, timeslot }, readDragSource(source)),
    collisionDetector: topInsideDroppable,
  });

  // a drawing starts on a free slot, and only when none is already in progress
  const canStartDraft = !isOccupied && !isDrawing;

  return (
    <div
      ref={droppable.ref}
      role="button"
      tabIndex={0}
      aria-label={label}
      onMouseDown={canStartDraft ? onStartDraft : undefined}
      onMouseEnter={canExtendDraft ? onExtendDraft : undefined}
      onMouseUp={canExtendDraft ? onCreateDraft : undefined}
      style={{ height: `${getTimeslotHeight(zoomLevel)}px` }}
      className={cx('relative', {
        'z-10': !isOccupied,
        'bg-blue-200': droppable.isDropTarget,
        'hover:bg-gray-50': canStartDraft,
        "before:absolute before:top-0 before:right-0 before:left-0 before:border-t before:content-['']":
          isFirstTimeslot && !droppable.isDropTarget && !isInsideDraft,
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
          renderSession={renderSession}
          zoomLevel={zoomLevel}
        />
      ) : draftSession ? (
        // session draft being drawn
        <SessionWrapper
          key={`draft-${draftSession.timeslot.end.toISOString()}`}
          gridRef={gridRef}
          session={draftSession}
          renderSession={renderSession}
          zoomLevel={zoomLevel}
        />
      ) : null}
    </div>
  );
}

type SessionWrapperProps = {
  gridRef: RefObject<ScheduleGrid>;
  session: ScheduleSession;
  renderSession: (session: ScheduleSession, height: number) => ReactNode;
  zoomLevel: number;
};

function SessionWrapper({ gridRef, session, renderSession, zoomLevel }: SessionWrapperProps) {
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
          {renderSession(session, height)}
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
