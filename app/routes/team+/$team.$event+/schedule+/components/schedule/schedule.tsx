import type { CollisionDetection, DragEndEvent } from '@dnd-kit/core';
import {
  DndContext,
  PointerSensor,
  rectIntersection,
  useDndContext,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { cx } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { addMinutes, format, isAfter, isBefore } from 'date-fns';
import { toTimeFormat } from '~/libs/datetimes/datetimes.ts';
import type { TimeSlot } from '~/libs/datetimes/timeslots.ts';
import {
  countIntervalsInTimeSlot,
  getDailyTimeSlots,
  haveSameStartDate,
  isAfterTimeSlot,
  isTimeSlotIncluded,
  moveTimeSlotStart,
} from '~/libs/datetimes/timeslots.ts';
import { getGMTOffset } from '~/libs/datetimes/timezone.ts';
import type { ScheduleSession, Track } from '../schedule.types.ts';
import type { TimeSlotSelector } from './use-timeslot-selector.tsx';
import { useTimeslotSelector } from './use-timeslot-selector.tsx';

const HOUR_INTERVAL = 60; // minutes
const SLOT_INTERVAL = 5; // minutes
const TIMESLOT_HEIGHTS = [4, 8, 16, 20, 24]; // px
const SESSIONS_GAP_PX = 1;

type ScheduleProps = {
  displayedDays: Array<Date>;
  displayedTimes: { start: number; end: number };
  timezone: string;
  interval?: number;
  tracks: Array<Track>;
  sessions: Array<ScheduleSession>;
  renderSession: (session: ScheduleSession, height: number) => ReactNode;
  onAddSession: (trackId: string, timeslot: TimeSlot) => void;
  onUpdateSession: (session: ScheduleSession) => boolean;
  onSelectSession: (session: ScheduleSession) => void;
  onSwitchSessions: (source: ScheduleSession, target: ScheduleSession) => void;
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
  onSelectSession,
  onSwitchSessions,
  zoomLevel,
}: ScheduleProps) {
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const { action, session } = active.data.current || {};
    const { type } = over?.data?.current || {};

    if (action === 'resize-session' && type === 'timeslot') {
      const { timeslot: targetTimeslot } = over?.data?.current || {};
      const updatedSession = safeSessionResizeToTimeslot(session, targetTimeslot, sessions);
      onUpdateSession(updatedSession);
    } else if (action === 'move-session' && type === 'timeslot') {
      const { trackId, timeslot: targetTimeslot } = over?.data?.current || {};
      const updatedSession = safeSessionMoveToTimeslot(session, trackId, targetTimeslot, sessions);
      onUpdateSession(updatedSession);
    } else if (action === 'move-session' && type === 'session') {
      const { session: sessionTarget } = over?.data?.current || {};
      onSwitchSessions(session, sessionTarget);
    }
  };

  // used to make a session clickable over dnd
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  return (
    <DndContext
      id="dnd-schedule"
      onDragEnd={handleDragEnd}
      sensors={sensors}
      collisionDetection={collisionDetection}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="flex divide-x-3">
        {displayedDays.map((day, index) => (
          <ScheduleDay
            key={format(day, 'yyyy-MM-dd')}
            day={day}
            dayIndex={index}
            displayedTimes={displayedTimes}
            timezone={timezone}
            tracks={tracks}
            sessions={sessions}
            renderSession={renderSession}
            onAddSession={onAddSession}
            onSelectSession={onSelectSession}
            zoomLevel={zoomLevel}
            displayMultipleDays={displayedDays.length > 1}
          />
        ))}
      </div>
    </DndContext>
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
  onAddSession: (trackId: string, timeslot: TimeSlot) => void;
  onSelectSession: (session: ScheduleSession) => void;
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
  onSelectSession,
  zoomLevel,
  displayMultipleDays,
}: ScheduleDayProps) {
  const startTime = addMinutes(day, displayedTimes.start);
  const endTime = addMinutes(day, displayedTimes.end);
  const hours = getDailyTimeSlots(startTime, endTime, HOUR_INTERVAL, true);
  const selector = useTimeslotSelector(sessions, onAddSession);

  return (
    <div className={cx('w-full bg-white', { 'select-none': selector.isSelecting })}>
      <table className="min-w-full border-separate border-spacing-0">
        {/* header */}
        <thead className="sticky top-[64px] bg-white z-30 shadow-sm">
          {displayMultipleDays && (
            <tr className="h-8">
              <th className="border-b text-sm font-semibold" colSpan={tracks.length + 1}>
                {format(day, 'PPP')}
              </th>
            </tr>
          )}
          <tr className={cx('divide-x', { 'h-12': !displayMultipleDays, 'h-8': displayMultipleDays })}>
            {/* gutter */}
            {dayIndex === 0 && (
              <th className="w-12 text-xs font-normal text-center bg-white text-gray-400">{getGMTOffset(timezone)}</th>
            )}
            {/* tracks header */}
            {tracks.map((track) => (
              <th key={track.id} className="text-sm font-semibold text-gray-900 truncate">
                {track.name}
              </th>
            ))}
          </tr>
        </thead>

        {/* content */}
        <tbody>
          {/* empty line */}
          <tr className="divide-x">
            {dayIndex === 0 && <td className="h-6 w-12" />}
            {tracks.map((track) => (
              <td key={track.id} className="h-6" />
            ))}
          </tr>

          {/* rows by hours */}
          {hours.map((hour) => {
            const startHour = toTimeFormat(hour.start);
            const endHour = toTimeFormat(hour.end);
            const hourSlots = getDailyTimeSlots(hour.start, hour.end, SLOT_INTERVAL);

            return (
              <tr key={`${startHour}-${endHour}`} className="divide-x">
                {/* gutter */}
                {dayIndex === 0 && (
                  <td className="relative whitespace-nowrap text-xs text-gray-500">
                    <time className="absolute -top-2 right-2" dateTime={startHour}>
                      {startHour}
                    </time>
                  </td>
                )}

                {/* rows by track */}
                {tracks.map((track) => (
                  <td key={track.id} className="p-0">
                    {hourSlots.map((timeslot, index) => {
                      return (
                        <Timeslot
                          key={toTimeFormat(timeslot.start)}
                          trackId={track.id}
                          timeslot={timeslot}
                          sessions={sessions}
                          selector={selector}
                          zoomLevel={zoomLevel}
                          isFirstTimeslot={index === 0}
                          onSelectSession={onSelectSession}
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

type TimeslotProps = {
  trackId: string;
  timeslot: TimeSlot;
  sessions: Array<ScheduleSession>;
  selector: TimeSlotSelector;
  zoomLevel: number;
  isFirstTimeslot: boolean;
  onSelectSession: (session: ScheduleSession) => void;
  renderSession: (session: ScheduleSession, height: number) => ReactNode;
};

function Timeslot({
  trackId,
  timeslot,
  sessions,
  selector,
  zoomLevel,
  isFirstTimeslot,
  onSelectSession,
  renderSession,
}: TimeslotProps) {
  // global dnd context
  const { active } = useDndContext();

  // selection attributes
  const isSelected = selector.isSelectedSlot(trackId, timeslot);
  const selectedSlot = selector.getSelectedSlot(trackId);

  // is timeslot include a session
  const timeslotSession = sessions.find((s) => s.trackId === trackId && isTimeSlotIncluded(timeslot, s.timeslot));
  const hasSession = Boolean(timeslotSession);

  // current dragging action
  const { session: draggingSession, action: draggingAction } = active?.data?.current || {};
  const isTimeslotSessionDragging = hasSession && timeslotSession?.id === draggingSession?.id;
  const isMovingAction = draggingAction === 'move-session';

  // displayed session on first session timeslot
  const session = timeslotSession && haveSameStartDate(timeslot, timeslotSession.timeslot) ? timeslotSession : null;

  // droppable to switch sessions
  const { setNodeRef, isOver } = useDroppable({
    id: `${trackId}-${timeslot.start.toISOString()}`,
    data: { type: 'timeslot', trackId, timeslot },
    disabled: hasSession && isMovingAction && !isTimeslotSessionDragging,
  });

  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      aria-label={`Timeslot ${toTimeFormat(timeslot.start)}`}
      onMouseDown={!hasSession ? selector.onSelectStart(trackId, timeslot) : undefined}
      onMouseEnter={!hasSession ? selector.onSelectHover(trackId, timeslot) : undefined}
      onMouseUp={selector.onSelect}
      style={{ height: `${getTimeslotHeight(zoomLevel)}px` }}
      className={cx('relative', {
        'z-10': !hasSession,
        'bg-blue-200': isOver && isMovingAction,
        'hover:bg-gray-50': !hasSession && !isSelected,
        "before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:border-t":
          isFirstTimeslot && !isOver,
      })}
    >
      {/* invisible span to have content for the table */}
      <span className="invisible">{`Timeslot ${toTimeFormat(timeslot.start)}`}</span>
      {session ? (
        // displayed session block
        <SessionWrapper
          session={session}
          sessions={sessions}
          renderSession={renderSession}
          onClick={onSelectSession}
          interval={SLOT_INTERVAL}
          zoomLevel={zoomLevel}
        />
      ) : selectedSlot && haveSameStartDate(timeslot, selectedSlot) ? (
        // display pre-rendered on session creation
        <SessionWrapper
          session={{ id: 'selection', trackId, timeslot: selectedSlot, color: 'stone', emojis: [], language: null }}
          sessions={sessions}
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
  sessions: Array<ScheduleSession>;
  renderSession: (session: ScheduleSession, height: number) => ReactNode;
  onClick?: (session: ScheduleSession) => void;
  interval: number;
  zoomLevel: number;
};

function SessionWrapper({ session, sessions, renderSession, onClick, interval, zoomLevel }: SessionWrapperProps) {
  const { active } = useDndContext();
  const isOtherDraggingSession = active?.data?.current?.session?.id !== session.id;
  const currentDraggingAction = active?.data?.current?.action;

  // draggable to move session
  const movable = useDraggable({
    id: `move:${session.id}`,
    data: { session, action: 'move-session' },
    disabled: isOtherDraggingSession && currentDraggingAction === 'resize-session',
  });

  // draggable to resize session
  const resizable = useDraggable({
    id: `resize:${session.id}`,
    data: { session, action: 'resize-session' },
    disabled: isOtherDraggingSession && currentDraggingAction === 'move-session',
  });

  // droppable to switch sessions
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop:${session.id}`,
    data: { type: 'session', session },
    disabled: movable.isDragging || resizable.isDragging || currentDraggingAction === 'resize-session',
  });

  // update displayed times on session when dragging
  if (movable.isDragging && movable.over?.data?.current?.type === 'timeslot') {
    const { timeslot } = movable.over.data.current || {};
    const newTimeslot = moveTimeSlotStart(session.timeslot, timeslot.start);
    session = { ...session, timeslot: newTimeslot };
  }

  // update displayed times on session resize
  if (resizable.isDragging && resizable.over?.data?.current?.type === 'timeslot') {
    const { timeslot: targetSlot } = resizable.over.data.current;
    session = safeSessionResizeToTimeslot(session, targetSlot, sessions);
  }

  // compute session height
  const intervalsCount = countIntervalsInTimeSlot(session.timeslot, interval);
  const height = getTimeslotHeight(zoomLevel) * intervalsCount - SESSIONS_GAP_PX;

  return (
    <>
      {/* session position & handler */}
      <div
        ref={movable.setNodeRef}
        className={cx('absolute z-20 overflow-hidden text-left', {
          'ring-1 ring-blue-600 rounded-md': isOver,
          'shadow-lg': movable.isDragging,
          'cursor-pointer': !currentDraggingAction,
          'cursor-grabbing': movable.isDragging && currentDraggingAction === 'move-session',
          'cursor-ns-resize': resizable.isDragging && currentDraggingAction === 'resize-session',
        })}
        onClick={() => (onClick ? onClick(session) : undefined)}
        style={{
          top: '0px',
          left: '1px',
          right: '1px',
          transform: movable.transform
            ? `translate3d(${movable.transform.x}px, ${movable.transform.y}px, 0)`
            : undefined,
          zIndex: movable.isDragging ? '40' : undefined,
        }}
        {...movable.listeners}
        {...movable.attributes}
      >
        <div ref={setDropRef} style={{ height: `${height}px` }}>
          {renderSession(session, height)}
        </div>
      </div>

      {/* resize handler */}
      {currentDraggingAction !== 'move-session' ? (
        <div
          ref={resizable.setNodeRef}
          style={{ top: `${height}px` }}
          className="absolute -bottom-1 h-1 w-full cursor-ns-resize z-40"
          {...resizable.listeners}
          {...resizable.attributes}
        />
      ) : null}
    </>
  );
}

// Get a single timeslot height
function getTimeslotHeight(zoomLevel: number) {
  if (zoomLevel >= 0 && zoomLevel < TIMESLOT_HEIGHTS.length) {
    return TIMESLOT_HEIGHTS[zoomLevel];
  }
  return TIMESLOT_HEIGHTS[0];
}

// Check for collisions prioritizing the top of droppable elements
const collisionDetection: CollisionDetection = (args) => {
  const { droppableContainers, collisionRect } = args;

  const prioritizedCollisions = droppableContainers.filter(({ rect }) => {
    if (!rect.current) return false;
    return collisionRect.top >= rect.current.top && collisionRect.top <= rect.current.bottom;
  });

  return rectIntersection({ ...args, droppableContainers: prioritizedCollisions });
};

// Return a valid resized session according given target timeslot
function safeSessionResizeToTimeslot(
  session: ScheduleSession,
  targetTimeslot: TimeSlot,
  sessions: Array<ScheduleSession>,
) {
  const trackSessions = sessions
    .filter((s) => s.trackId === session.trackId && s.id !== session.id)
    .sort((a, b) => {
      if (isAfterTimeSlot(a.timeslot, b.timeslot)) return 1;
      return -1;
    });

  const sessionAfter = trackSessions.filter((s) => isAfterTimeSlot(s.timeslot, session.timeslot)).at(0);
  let { start, end } = session.timeslot;
  if (sessionAfter && isAfter(targetTimeslot.end, sessionAfter.timeslot.start)) {
    end = sessionAfter.timeslot.start; // end cannot be after the next session
  } else if (isBefore(targetTimeslot.end, start)) {
    end = addMinutes(start, SLOT_INTERVAL); // end cannot be before the start
  } else {
    end = targetTimeslot.end;
  }
  return { ...session, timeslot: { start, end } };
}

// Return a valid moved session according given target trackId and timeslot
function safeSessionMoveToTimeslot(
  session: ScheduleSession,
  targetTrackId: string,
  targetTimeslot: TimeSlot,
  sessions: Array<ScheduleSession>,
) {
  const trackSessions = sessions
    .filter((s) => s.trackId === targetTrackId && s.id !== session.id)
    .sort((a, b) => {
      if (isAfterTimeSlot(a.timeslot, b.timeslot)) return 1;
      return -1;
    });

  let { start, end } = moveTimeSlotStart(session.timeslot, targetTimeslot.start);
  const sessionAfter = trackSessions.filter((s) => isAfterTimeSlot(s.timeslot, { start, end })).at(0);

  if (sessionAfter && isAfter(end, sessionAfter.timeslot.start)) {
    end = sessionAfter.timeslot.start; // end cannot be after the next session
  }
  return { ...session, trackId: targetTrackId, timeslot: { start, end } };
}
