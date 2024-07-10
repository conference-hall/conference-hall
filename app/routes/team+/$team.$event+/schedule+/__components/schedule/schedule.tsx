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

import { getGMTOffset } from '~/libs/datetimes/timezone.ts';

import type { ScheduleSession, TimeSlot, Track } from '../schedule.types.ts';
import {
  countIntervalsInTimeSlot,
  formatTime,
  getDailyTimeSlots,
  haveSameStartDate,
  isTimeSlotIncluded,
  moveTimeSlotStart,
  totalTimeInMinutes,
} from './timeslots.ts';
import type { TimeSlotSelector } from './use-timeslot-selector.tsx';
import { useTimeslotSelector } from './use-timeslot-selector.tsx';

const HOUR_INTERVAL = 60; // minutes
const SLOT_INTERVAL = 5; // minutes
const TIMESLOT_HEIGHTS = [8, 12, 16, 20]; // px
const DEFAULT_ZOOM_LEVEL = 1;

type ScheduleProps = {
  day: Date;
  startTime: Date;
  endTime: Date;
  timezone: string;
  interval?: number;
  tracks: Array<Track>;
  sessions: Array<ScheduleSession>;
  renderSession: (session: ScheduleSession) => ReactNode;
  onAddSession: (trackId: string, timeslot: TimeSlot) => void;
  onMoveSession: (session: ScheduleSession, newTrackId: string, newTimeslot: TimeSlot) => void;
  onSelectSession: (session: ScheduleSession) => void;
  onSwitchSessions: (source: ScheduleSession, target: ScheduleSession) => void;
  zoomLevel?: number;
};

export default function Schedule({
  day,
  startTime,
  endTime,
  timezone,
  interval = SLOT_INTERVAL,
  tracks = [],
  sessions = [],
  renderSession,
  onAddSession,
  onMoveSession,
  onSelectSession,
  onSwitchSessions,
  zoomLevel = DEFAULT_ZOOM_LEVEL,
}: ScheduleProps) {
  const hours = getDailyTimeSlots(day, startTime, endTime, HOUR_INTERVAL);

  const selector = useTimeslotSelector(sessions, onAddSession);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over?.data?.current?.type === 'timeslot') {
      const { trackId, timeslot } = over.data.current || {};
      const { session } = active.data.current || {};
      onMoveSession(session, trackId, timeslot);
    } else if (over?.data?.current?.type === 'session') {
      const { session: source } = active.data.current || {};
      const { session: target } = over.data.current || {};
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
            <tr className="sticky top-[64px] z-30 divide-x divide-gray-200 shadow">
              {/* Gutter with timezone */}
              <th scope="col" className="h-12 text-xs font-normal text-center bg-white text-gray-400">
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
            <tr className="divide-x divide-gray-200 align-top">
              <td className="w-8"></td>
              {tracks.map((track) => (
                <td key={track.id} className="h-6 border-b"></td>
              ))}
            </tr>

            {/* Rows by hours */}
            {hours.map((hour, rowIndex) => {
              const startHour = formatTime(hour.start);
              const endHour = formatTime(hour.end);
              const hourSlots = getDailyTimeSlots(day, hour.start, hour.end, interval, true);

              return (
                <tr key={`${startHour}-${endHour}`} className="divide-x divide-gray-200 align-top">
                  {/* Gutter time */}
                  <td className="px-2 -mt-2 whitespace-nowrap text-xs text-gray-500 block">{startHour}</td>

                  {/* Rows by track */}
                  {tracks.map((track) => (
                    <td key={track.id} className={cx('p-0', { 'border-b': rowIndex !== hours.length - 1 })}>
                      {hourSlots.map((timeslot) => {
                        return (
                          <Timeslot
                            key={formatTime(timeslot.start)}
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
  const id = `${trackId}-${formatTime(timeslot.start)}`;

  // selection attributes
  const isSelected = selector.isSelectedSlot(trackId, timeslot);
  const selectedSlot = selector.getSelectedSlot(trackId);

  // is timeslot include a session
  const { active } = useDndContext();
  const currentSession = sessions.find((s) => s.trackId === trackId && isTimeSlotIncluded(timeslot, s.timeslot));
  const hasSession = Boolean(currentSession);
  const isCurrentSessionDragging = currentSession && active?.id === currentSession.id;

  // displayed session on first session timeslot
  const session = currentSession && haveSameStartDate(timeslot, currentSession.timeslot) ? currentSession : null;

  // Droppable for sessions switch
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'timeslot', trackId, timeslot },
    disabled: hasSession && !isCurrentSessionDragging,
  });

  return (
    <div
      ref={setNodeRef}
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
      {session ? (
        // Displayed session block
        <SessionWrapper
          session={session}
          renderSession={renderSession}
          onClick={onSelectSession}
          interval={interval}
          zoomLevel={zoomLevel}
        />
      ) : selectedSlot && haveSameStartDate(timeslot, selectedSlot) ? (
        // Display pre-rendered session on selection
        <SessionWrapper
          session={{ id: 'selection', trackId, timeslot: selectedSlot, color: 'gray' }}
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
  renderSession: (session: ScheduleSession) => ReactNode;
  onClick?: (session: ScheduleSession) => void;
  interval: number;
  zoomLevel: number;
};

function SessionWrapper({ session, renderSession, onClick, interval, zoomLevel }: SessionWrapperProps) {
  // draggable to move session
  const { attributes, listeners, setNodeRef, transform, isDragging, over } = useDraggable({
    id: session.id,
    data: { session },
  });

  // droppable to switch sessions
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop:${session.id}`,
    data: { type: 'session', session },
    disabled: isDragging,
  });

  // compute session height
  const totalTimeMinutes = totalTimeInMinutes(session.timeslot);
  const intervalsCount = countIntervalsInTimeSlot(session.timeslot, interval);
  const height = getTimeslotHeight(zoomLevel) * intervalsCount + Math.ceil(totalTimeMinutes / HOUR_INTERVAL) - 3;

  // update displayed times on session when dragging
  if (isDragging && over?.data?.current?.type === 'timeslot') {
    const { timeslot } = over.data.current || {};
    session = { ...session, timeslot: moveTimeSlotStart(session.timeslot, timeslot.start) };
  }

  return (
    <div
      ref={setNodeRef}
      className={cx('absolute z-20 overflow-hidden text-left', { 'ring-1 ring-blue-600 rounded-md': isOver })}
      onClick={() => (onClick ? onClick(session) : undefined)}
      style={{
        top: '1px',
        left: '1px',
        right: '1px',
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? '40' : undefined,
      }}
      {...listeners}
      {...attributes}
    >
      <div ref={setDropRef} style={{ height: `${height}px` }}>
        {renderSession(session)}
      </div>
    </div>
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
