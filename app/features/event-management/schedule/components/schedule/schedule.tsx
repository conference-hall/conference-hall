// `useDroppable` and `useDraggable` expose callback refs (`droppable.ref`, `movable.ref`) alongside plain state
// (`isDropTarget`, `isDragging`), none of which read `.current` during render.
// oxlint-disable react/refs
import { RestrictToWindow } from '@dnd-kit/dom/modifiers';
import { DragDropProvider, PointerSensor, useDragDropMonitor, useDraggable, useDroppable } from '@dnd-kit/react';
import { cx } from 'class-variance-authority';
import { addMinutes } from 'date-fns';
import type { ReactNode } from 'react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { formatDate, formatTime, toDateInput } from '~/shared/datetimes/datetimes.ts';
import type { TimeSlot } from '~/shared/datetimes/timeslots.ts';
import {
  getDailyTimeSlots,
  haveSameStartDate,
  isNextTimeslotInWindow,
  isTimeSlotIncluded,
} from '~/shared/datetimes/timeslots.ts';
import { getGMTOffset } from '~/shared/datetimes/timezone.ts';
import { deepEqual } from '~/shared/utils/deep-equal.ts';
import { type PlacementOutcome, SessionPlacement } from '../../models/session-placement.ts';
import type { ScheduleSession, Track } from '../schedule.types.ts';
import { HOUR_INTERVAL, SLOT_INTERVAL } from './config.ts';
import { getSessionHeight, getTimeslotHeight, topInsideDroppable } from './helpers.ts';

type ScheduleProps = {
  displayedDays: Array<Date>;
  displayedTimes: { start: number; end: number };
  timezone: string;
  interval?: number;
  tracks: Array<Track>;
  sessions: Array<ScheduleSession>;
  renderSession: (session: ScheduleSession, height: number) => ReactNode;
  onAddSession: (session: Omit<ScheduleSession, 'id' | 'isCreating'>) => Promise<boolean>;
  onUpdateSession: (session: ScheduleSession) => Promise<boolean>;
  onSwitchSessions: (source: ScheduleSession, target: ScheduleSession) => Promise<boolean>;
  zoomLevel: number;
};

export default function Schedule({
  displayedDays,
  displayedTimes,
  timezone,
  tracks = [],
  sessions = [],
  renderSession,
  onAddSession,
  onUpdateSession,
  onSwitchSessions,
  zoomLevel,
}: ScheduleProps) {
  const { t } = useTranslation();
  const placement = new SessionPlacement(sessions);

  const reportConflict = () => toast.error(t('event-management.schedule.errors.session-conflict'));

  const applyOutcome = async (session: ScheduleSession, outcome: PlacementOutcome) => {
    if (outcome.status === 'conflict') return reportConflict();
    const applied = await onUpdateSession({
      ...session,
      trackId: outcome.placement.trackId,
      timeslot: outcome.placement.timeslot,
    });
    if (!applied) reportConflict();
  };

  return (
    <DragDropProvider
      sensors={[PointerSensor]}
      modifiers={[RestrictToWindow]}
      onDragEnd={async (event) => {
        const { operation, canceled } = event;
        const { source, target } = operation;

        if (canceled || !source || !target) return;

        const { session } = source.data || {};

        if (source.type === 'resize-session' && target.type === 'timeslot-drop') {
          const { timeslot: targetTimeslot } = target.data || {};
          await applyOutcome(session, placement.resize(session, targetTimeslot.end));
        } else if (source.type === 'move-session' && target.type === 'timeslot-drop') {
          const { trackId, timeslot: targetTimeslot } = target.data || {};
          await applyOutcome(session, placement.move(session, { trackId, start: targetTimeslot.start }));
        } else if (source.type === 'move-session' && target.type === 'session-drop') {
          const { session: sessionTarget } = target.data || {};
          const switched = await onSwitchSessions(session, sessionTarget);
          if (!switched) reportConflict();
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
            timezone={timezone}
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

type ScheduleDayProps = {
  day: Date;
  dayIndex: number;
  timezone: string;
  displayedTimes: { start: number; end: number };
  tracks: Array<Track>;
  sessions: Array<ScheduleSession>;
  renderSession: (session: ScheduleSession, height: number) => ReactNode;
  onAddSession: (session: Omit<ScheduleSession, 'id' | 'isCreating'>) => Promise<boolean>;
  zoomLevel: number;
  displayMultipleDays: boolean;
};

function ScheduleDay({
  day,
  dayIndex,
  timezone,
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

  const startTime = addMinutes(day, displayedTimes.start);
  const endTime = addMinutes(day, displayedTimes.end);
  const hours = getDailyTimeSlots(startTime, endTime, HOUR_INTERVAL, true);
  const placement = new SessionPlacement(sessions);

  const [newSession, setNewSession] = useState<ScheduleSession | null>(null);
  const handleNewSession = useCallback(async () => {
    if (!newSession) return;
    await onAddSession(newSession);
    setNewSession(null);
  }, [newSession, onAddSession]);

  return (
    <div className={cx('w-full bg-white', { 'select-none': newSession !== null })}>
      <table className="w-full table-fixed border-separate border-spacing-0">
        {/* header */}
        <thead className="sticky top-[64px] z-30 bg-white shadow-sm">
          {displayMultipleDays && (
            <tr className="h-8">
              {/* gutter */}
              {dayIndex === 0 && <th className="w-12 border-b" aria-hidden />}
              {/* day */}
              <th className="border-b text-sm font-semibold" colSpan={tracks.length}>
                {formatDate(day, { format: 'long', locale })}
              </th>
            </tr>
          )}
          <tr className={cx('divide-x', { 'h-12': !displayMultipleDays, 'h-8': displayMultipleDays })}>
            {/* gutter */}
            {dayIndex === 0 && (
              <th className="w-12 bg-white text-center text-xs font-normal text-gray-400">
                {getGMTOffset(timezone, locale)}
              </th>
            )}
            {/* tracks header */}
            {tracks.map((track) => (
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
            {tracks.map((track) => (
              <td key={track.id} className="h-6" aria-label={track.name} />
            ))}
          </tr>

          {/* rows by hours */}
          {hours.map((hour) => {
            const startHour = formatTime(hour.start, { format: 'short', locale });
            const endHour = formatTime(hour.end, { format: 'short', locale });
            const hourSlots = getDailyTimeSlots(hour.start, hour.end, SLOT_INTERVAL);

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
                {tracks.map((track) => (
                  <td key={track.id} className="p-0">
                    {hourSlots.map((timeslot, index) => {
                      // Get the session included in the current timeslot
                      const session = sessions.find(
                        (s) => s.trackId === track.id && isTimeSlotIncluded(timeslot, s.timeslot),
                      );

                      // Check if the timeslot is allowed for a new session: within the drawing window and free
                      const canCreateSession =
                        newSession?.trackId === track.id &&
                        isNextTimeslotInWindow(newSession.timeslot, timeslot, SLOT_INTERVAL) &&
                        placement.place({ trackId: track.id, timeslot }).status === 'placed';

                      return (
                        <MemoizedTimeslot
                          key={`${track.id}-${timeslot.start.toISOString()}`}
                          trackId={track.id}
                          timeslot={timeslot}
                          session={session}
                          zoomLevel={zoomLevel}
                          isFirstTimeslot={index === 0}
                          newSession={canCreateSession ? newSession : undefined}
                          onCreateNewSession={canCreateSession ? handleNewSession : undefined}
                          onChangeNewSession={setNewSession}
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

// Memoized Timeslot component to prevent unnecessary re-renders
const MemoizedTimeslot = React.memo(Timeslot, (prevProps, nextProps) => {
  return (
    prevProps.trackId === nextProps.trackId &&
    prevProps.zoomLevel === nextProps.zoomLevel &&
    prevProps.newSession === nextProps.newSession &&
    deepEqual(prevProps.timeslot, nextProps.timeslot) &&
    deepEqual(prevProps.session, nextProps.session)
  );
});

type TimeslotProps = {
  trackId: string;
  timeslot: TimeSlot;
  session?: ScheduleSession;
  zoomLevel: number;
  isFirstTimeslot: boolean;
  newSession?: ScheduleSession | null;
  onChangeNewSession?: (session: ScheduleSession | null) => void;
  onCreateNewSession?: () => void;
  renderSession: (session: ScheduleSession, height: number) => ReactNode;
};

function Timeslot({
  trackId,
  timeslot,
  session,
  zoomLevel,
  isFirstTimeslot,
  newSession,
  onChangeNewSession,
  onCreateNewSession,
  renderSession,
}: TimeslotProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  // displayed session on first session timeslot
  const displayedSession = session && haveSameStartDate(timeslot, session.timeslot) ? session : undefined;

  // droppable timeslot
  const droppable = useDroppable({
    id: `${trackId}-${timeslot.start.toISOString()}`,
    type: 'timeslot-drop',
    data: { trackId, timeslot, currentSessionId: session?.id },
    accept: (source) => {
      return !session || source.type !== 'move-session' || (session && session?.id === source.data.session?.id);
    },
    collisionDetector: topInsideDroppable,
  });

  // start a new session on mouse down
  const handleStartNewSession = () => {
    if (session || newSession) return;
    onChangeNewSession?.({ id: 'new', trackId, timeslot, color: 'stone', emojis: [], language: null });
  };

  // extend the new session on mouse enter
  const handleExtendNewSession = () => {
    if (!newSession) return;
    onChangeNewSession?.({ ...newSession, timeslot: { start: newSession.timeslot.start, end: timeslot.end } });
  };

  return (
    <div
      ref={droppable.ref}
      role="button"
      tabIndex={0}
      aria-label={`Timeslot ${formatTime(timeslot.start, { format: 'short', locale })}`}
      onMouseDown={handleStartNewSession}
      onMouseEnter={handleExtendNewSession}
      onMouseUp={onCreateNewSession}
      style={{ height: `${getTimeslotHeight(zoomLevel)}px` }}
      className={cx('relative', {
        'z-10': !session,
        'bg-blue-200': droppable.isDropTarget,
        'hover:bg-gray-50': !session && !newSession,
        "before:absolute before:top-0 before:right-0 before:left-0 before:border-t before:content-['']":
          isFirstTimeslot && !droppable.isDropTarget && !isTimeSlotIncluded(timeslot, newSession?.timeslot),
      })}
    >
      {/* invisible span to have content for the table */}
      <span className="invisible">{`Timeslot ${formatTime(timeslot.start, { format: 'short', locale })}`}</span>

      {displayedSession ? (
        // displayed session block
        <SessionWrapper
          key={`${displayedSession.id}-${displayedSession.timeslot.start.toISOString()}-${displayedSession.timeslot.end.toISOString()}-${zoomLevel}`}
          session={displayedSession}
          renderSession={renderSession}
          interval={SLOT_INTERVAL}
          zoomLevel={zoomLevel}
        />
      ) : newSession && haveSameStartDate(timeslot, newSession.timeslot) ? (
        // display pre-rendered on session creation
        <SessionWrapper
          key={`new-${newSession.timeslot.end.toISOString()}`}
          session={newSession}
          renderSession={renderSession}
          interval={SLOT_INTERVAL}
          zoomLevel={zoomLevel}
        />
      ) : null}
    </div>
  );
}

type SessionWrapperProps = {
  session: ScheduleSession;
  renderSession: (session: ScheduleSession, height: number) => ReactNode;
  interval: number;
  zoomLevel: number;
};

function SessionWrapper({ session, renderSession, interval, zoomLevel }: SessionWrapperProps) {
  // Compute session height
  const defaultHeight = getSessionHeight(session, interval, zoomLevel);
  const [height, setHeight] = useState(defaultHeight);

  // update height on session resize
  useDragDropMonitor({
    onDragMove: ({ operation }) => {
      if (!operation.target || !operation.source) return;
      if (operation.source.type !== 'resize-session') return;
      if (operation.source.data?.session?.id !== session.id) return;

      const { timeslot, currentSessionId } = operation.target.data;
      if (currentSessionId && currentSessionId !== session.id) return;

      const newTimeslot = { start: session.timeslot.start, end: timeslot.end };
      setHeight(getSessionHeight({ ...session, timeslot: newTimeslot }, interval, zoomLevel));
    },
  });

  // draggable to move session
  const movable = useDraggable({
    id: `move:${session.id}`,
    type: 'move-session',
    data: { session },
    disabled: session.isCreating,
  });

  // draggable to resize session
  const resizable = useDraggable({
    id: `resize:${session.id}`,
    type: 'resize-session',
    data: { session },
    disabled: session.isCreating,
  });

  // droppable to switch sessions
  const droppable = useDroppable({
    id: `drop:${session.id}`,
    type: 'session-drop',
    data: { session },
    disabled: movable.isDragging || resizable.isDragging,
    accept: ['move-session'],
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
