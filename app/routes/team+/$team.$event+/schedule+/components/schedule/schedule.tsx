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

import { toTimeFormat } from '~/libs/datetimes/datetimes.ts';
import type { TimeSlot } from '~/libs/datetimes/timeslots.ts';
import {
  areTimeSlotsOverlapping,
  countIntervalsInTimeSlot,
  getDailyTimeSlots,
  haveSameStartDate,
  isAfterTimeSlot,
  isTimeSlotIncluded,
  moveTimeSlotStart,
  totalTimeInMinutes,
} from '~/libs/datetimes/timeslots.ts';
import { getGMTOffset } from '~/libs/datetimes/timezone.ts';

import type { ScheduleSession, Track } from '../schedule.types.ts';
import type { TimeSlotSelector } from './use-timeslot-selector.tsx';
import { useTimeslotSelector } from './use-timeslot-selector.tsx';

const HOUR_INTERVAL = 60; // minutes
const SLOT_INTERVAL = 5; // minutes
const TIMESLOT_HEIGHTS = [8, 12, 16, 20]; // px
const DEFAULT_ZOOM_LEVEL = 1;

type ScheduleProps = {
  startTime: Date;
  endTime: Date;
  timezone: string;
  interval?: number;
  tracks: Array<Track>;
  sessions: Array<ScheduleSession>;
  renderSession: (session: ScheduleSession) => ReactNode;
  onAddSession: (trackId: string, timeslot: TimeSlot) => void;
  onMoveSession: (session: ScheduleSession) => void;
  onResizeSession: (session: ScheduleSession) => void;
  onSelectSession: (session: ScheduleSession) => void;
  onSwitchSessions: (source: ScheduleSession, target: ScheduleSession) => void;
  zoomLevel?: number;
};

export default function Schedule({
  startTime,
  endTime,
  timezone,
  interval = SLOT_INTERVAL,
  tracks = [],
  sessions = [],
  renderSession,
  onAddSession,
  onMoveSession,
  onResizeSession,
  onSelectSession,
  onSwitchSessions,
  zoomLevel = DEFAULT_ZOOM_LEVEL,
}: ScheduleProps) {
  const hours = getDailyTimeSlots(startTime, endTime, HOUR_INTERVAL, true);

  const selector = useTimeslotSelector(sessions, onAddSession);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const { action } = active.data.current || {};
    const { type } = over?.data?.current || {};

    if (action === 'resize-session' && type === 'timeslot') {
      const { timeslot } = over?.data?.current || {};
      const { session } = active.data.current || {};
      const newTimeslot = { start: session.timeslot.start, end: timeslot.end };
      const newSession = safeSessionTimeslotUpdate({ ...session, timeslot: newTimeslot }, sessions);
      onResizeSession(newSession);
    } else if (action === 'move-session' && type === 'timeslot') {
      const { trackId, timeslot } = over?.data?.current || {};
      const { session } = active.data.current || {};
      const newTimeslot = moveTimeSlotStart(session.timeslot, timeslot.start);
      const newSession = safeSessionTimeslotUpdate({ ...session, trackId, timeslot: newTimeslot }, sessions);
      onMoveSession(newSession);
    } else if (action === 'move-session' && type === 'session') {
      const { session: source } = active.data.current || {};
      const { session: target } = over?.data?.current || {};
      onSwitchSessions(source, target);
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
      <div className={cx('w-full bg-white', { 'select-none': selector.isSelecting })}>
        <table className="min-w-full border-separate border-spacing-0">
          {/* Header */}
          <thead>
            <tr className="sticky top-[64px] z-30 divide-x divide-gray-200 shadow-sm">
              {/* Gutter with timezone */}
              <th scope="col" className="h-12 w-12 text-xs font-normal text-center bg-white text-gray-400">
                {getGMTOffset(timezone)}
              </th>
              {/* Tracks header */}
              {tracks.map((track) => (
                <th scope="col" key={track.id} className="h-12 relative bg-white">
                  <div className="absolute flex items-center justify-center top-0 bottom-0 right-0 left-0 overflow-hidden">
                    <p className="p-2 text-sm font-semibold text-gray-900 truncate">{track.name}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Content */}
          <tbody>
            {/* Empty line */}
            <tr className="divide-x divide-gray-200">
              <td className="h-6 w-12" />
              {tracks.map((track) => (
                <td key={track.id} className="h-6 border-b" />
              ))}
            </tr>

            {/* Rows by hours */}
            {hours.map((hour, rowIndex) => {
              const startHour = toTimeFormat(hour.start);
              const endHour = toTimeFormat(hour.end);
              const hourSlots = getDailyTimeSlots(hour.start, hour.end, interval);

              return (
                <tr key={`${startHour}-${endHour}`} className="divide-x divide-gray-200">
                  {/* Gutter time */}
                  <td className="relative whitespace-nowrap text-xs text-gray-500">
                    <time className="absolute -top-2 right-2" dateTime={startHour}>
                      {startHour}
                    </time>
                  </td>

                  {/* Rows by track */}
                  {tracks.map((track) => (
                    <td key={track.id} className={cx('p-0', { 'border-b': rowIndex !== hours.length - 1 })}>
                      {hourSlots.map((timeslot) => {
                        return (
                          <Timeslot
                            key={toTimeFormat(timeslot.start)}
                            trackId={track.id}
                            timeslot={timeslot}
                            sessions={sessions}
                            selector={selector}
                            interval={interval}
                            zoomLevel={zoomLevel}
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
    </DndContext>
  );
}

type TimeslotProps = {
  trackId: string;
  timeslot: TimeSlot;
  sessions: Array<ScheduleSession>;
  selector: TimeSlotSelector;
  interval: number;
  zoomLevel: number;
  onSelectSession: (session: ScheduleSession) => void;
  renderSession: (session: ScheduleSession) => ReactNode;
};

function Timeslot({
  trackId,
  timeslot,
  sessions,
  selector,
  interval,
  zoomLevel,
  onSelectSession,
  renderSession,
}: TimeslotProps) {
  // selection attributes
  const isSelected = selector.isSelectedSlot(trackId, timeslot);
  const selectedSlot = selector.getSelectedSlot(trackId);

  // is timeslot include a session
  // const { active } = useDndContext();
  const currentSession = sessions.find((s) => s.trackId === trackId && isTimeSlotIncluded(timeslot, s.timeslot));
  const hasSession = Boolean(currentSession);
  // const isCurrentSessionMoving = Boolean(active) && active?.id === `move:${currentSession?.id}`;
  // const otherCurrentSessionMoving = Boolean(active) && active?.id !== `move:${currentSession?.id}`;

  // displayed session on first session timeslot
  const session = currentSession && haveSameStartDate(timeslot, currentSession.timeslot) ? currentSession : null;

  // Droppable for sessions switch
  const { setNodeRef, isOver } = useDroppable({
    id: `${trackId}-${timeslot.start.toISOString()}`,
    data: { type: 'timeslot', trackId, timeslot },
    // disabled: hasSession && !isCurrentSessionMoving && !otherCurrentSessionMoving,
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
        'hover:bg-gray-50': !hasSession && !isSelected,
        'border-t-2 border-blue-600': isOver,
      })}
    >
      {/* Invisible span to have content for the table */}
      <span className="invisible">{`Timeslot ${toTimeFormat(timeslot.start)}`}</span>
      {session ? (
        // Displayed session block
        <SessionWrapper
          session={session}
          sessions={sessions}
          renderSession={renderSession}
          onClick={onSelectSession}
          interval={interval}
          zoomLevel={zoomLevel}
        />
      ) : selectedSlot && haveSameStartDate(timeslot, selectedSlot) ? (
        // Display pre-rendered session on selection
        <SessionWrapper
          session={{ id: 'selection', trackId, timeslot: selectedSlot, color: 'gray' }}
          sessions={sessions}
          renderSession={renderSession}
          interval={interval}
          zoomLevel={zoomLevel}
        />
      ) : null}
    </div>
  );
}

type SessionWrapperProps = {
  session: ScheduleSession;
  sessions: Array<ScheduleSession>;
  renderSession: (session: ScheduleSession) => ReactNode;
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
    const newTimeslot = { start: session.timeslot.start, end: targetSlot.end };
    session = safeSessionTimeslotUpdate({ ...session, timeslot: newTimeslot }, sessions);
  }

  // compute session height
  const totalTimeMinutes = totalTimeInMinutes(session.timeslot);
  const intervalsCount = countIntervalsInTimeSlot(session.timeslot, interval);
  const height = getTimeslotHeight(zoomLevel) * intervalsCount + Math.ceil(totalTimeMinutes / HOUR_INTERVAL) - 3;

  return (
    <>
      {/* session position & handler */}
      <div
        ref={movable.setNodeRef}
        className={cx('absolute z-20 overflow-hidden text-left', {
          'ring-1 ring-blue-600 rounded-md': isOver,
          'cursor-pointer': !currentDraggingAction,
          'cursor-grabbing': movable.isDragging && currentDraggingAction === 'move-session',
          'cursor-ns-resize': resizable.isDragging && currentDraggingAction === 'resize-session',
        })}
        onClick={() => (onClick ? onClick(session) : undefined)}
        style={{
          top: '1px',
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
        <div ref={setDropRef} style={{ height: `${height}px` }} className="overflow-auto">
          {renderSession(session)}
        </div>
      </div>
      {/* resize handler */}
      {currentDraggingAction !== 'move-session' ? (
        <div
          ref={resizable.setNodeRef}
          style={{ top: `${height}px` }}
          className="absolute -bottom-1 h-2 w-full cursor-ns-resize z-40"
          {...resizable.listeners}
          {...resizable.attributes}
        />
      ) : null}
    </>
  );
}

function getTimeslotHeight(zoomLevel: number) {
  if (zoomLevel >= 0 && zoomLevel < TIMESLOT_HEIGHTS.length) {
    return TIMESLOT_HEIGHTS[zoomLevel];
  }
  return TIMESLOT_HEIGHTS[DEFAULT_ZOOM_LEVEL];
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

function safeSessionTimeslotUpdate(session: ScheduleSession, sessions: Array<ScheduleSession>) {
  const trackSessions = sessions
    .filter((s) => s.trackId === session.trackId && s.id !== session.id)
    .sort((a, b) => {
      if (isAfterTimeSlot(a.timeslot, b.timeslot)) return 1;
      return -1;
    });

  const sessionBefore = trackSessions.filter((s) => isAfterTimeSlot(session.timeslot, s.timeslot)).at(-1);
  const sessionAfter = trackSessions.filter((s) => isAfterTimeSlot(s.timeslot, session.timeslot)).at(0);

  let { start, end } = session.timeslot;
  if (sessionBefore && areTimeSlotsOverlapping(session.timeslot, sessionBefore.timeslot)) {
    start = sessionBefore.timeslot.end;
  }
  if (sessionAfter && areTimeSlotsOverlapping(session.timeslot, sessionAfter.timeslot)) {
    end = sessionAfter.timeslot.start;
  }
  return { ...session, timeslot: { start, end } };
}
