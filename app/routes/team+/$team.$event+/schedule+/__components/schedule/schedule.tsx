import type { CollisionDetection, DragEndEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  PointerSensor,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { cx } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { v4 as uuid } from 'uuid';

import { useSessions } from './hooks/use-sessions.tsx';
import type { TimeSlotSelector } from './hooks/use-timeslot-selector.tsx';
import { useTimeslotSelector } from './hooks/use-timeslot-selector.tsx';
import type { Session, TimeSlot, Track } from './types.ts';
import { countIntervalsInTimeSlot, formatTime, getDailyTimeSlots, totalTimeInMinutes } from './utils/timeslots.ts';

const HOUR_INTERVAL = 60; // minutes
const SLOT_INTERVAL = 5; // minutes
const TIMESLOT_HEIGHTS = [8, 12, 16, 20]; // px
const DEFAULT_ZOOM_LEVEL = 1;
const DEFAULT_TRACK: Track = { id: 'track-1', name: 'Track' };

type ScheduleProps = {
  day: Date;
  startTime: string; // TODO: rename display time else 00:00
  endTime: string; // TODO: rename display time else 23:00
  interval?: number;
  tracks: Array<Track>;
  initialSessions: Array<Session>;
  renderSession: (session: Session, zoomLevel: number, oneLine: boolean) => ReactNode;
  onAddSession: (session: Session) => void;
  onUpdateSession: (session: Session) => void;
  onSelectSession: (session: Session) => void;
  zoomLevel?: number;
};

export default function Schedule({
  day,
  startTime,
  endTime,
  interval = SLOT_INTERVAL,
  tracks = [DEFAULT_TRACK],
  initialSessions = [],
  renderSession,
  onAddSession,
  onUpdateSession,
  onSelectSession,
  zoomLevel = DEFAULT_ZOOM_LEVEL,
}: ScheduleProps) {
  const hours = getDailyTimeSlots(day, startTime, endTime, HOUR_INTERVAL);
  const sessions = useSessions(initialSessions);

  const handleAddSession = (trackId: string, timeslot: TimeSlot) => {
    const session = { id: uuid(), trackId, timeslot };
    const addedSession = sessions.addSession(session);
    if (addedSession) onAddSession(addedSession);
  };

  const selector = useTimeslotSelector(handleAddSession);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over?.data?.current?.type === 'timeslot') {
      const { trackId, timeslot } = over.data.current || {};
      const { session } = active.data.current || {};
      const movedSession = sessions.moveSession(session, trackId, timeslot);
      if (movedSession) onUpdateSession(movedSession);
    }
  };

  // used to make a session clickable over dnd
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors} collisionDetection={customCollisionDetection}>
      <div className={cx('w-full border-t border-gray-200', { 'select-none': selector.isSelecting })}>
        <table className="min-w-full border-separate border-spacing-0">
          {/* Gutter */}
          <thead>
            <tr className="sticky top-0 z-30 divide-x divide-gray-200 shadow">
              <th scope="col" className="w-6 h-12 bg-white text-left text-sm font-semibold text-gray-900"></th>
              {tracks.map((track) => (
                <th scope="col" key={track.id} className="h-12 bg-white relative">
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
              <td className="h-6"></td>
              {tracks.map((track) => (
                <td key={track.id} className="h-6 border-b"></td>
              ))}
            </tr>

            {/* Hours */}
            {hours.map((hour, rowIndex) => {
              const startTime = formatTime(hour.start);
              const endTime = formatTime(hour.end);
              const hourSlots = getDailyTimeSlots(day, startTime, endTime, interval, true);

              return (
                <tr key={`${startTime}-${endTime}`} className="divide-x divide-gray-200 align-top">
                  {/* Gutter time */}
                  <td className="px-2 -mt-2 whitespace-nowrap text-xs text-gray-500 block">{startTime}</td>

                  {/* Rows by track */}
                  {tracks.map((track) => (
                    <td key={track.id} className={cx('p-0', { 'border-b': rowIndex !== hours.length - 1 })}>
                      {hourSlots.map((slot) => {
                        const session = sessions.getSession(track.id, slot);
                        const selectable = !sessions.hasSession(track.id, slot);

                        return (
                          <Timeslot
                            key={formatTime(slot.start)}
                            trackId={track.id}
                            slot={slot}
                            selector={selector}
                            selectable={selectable}
                            zoomLevel={zoomLevel}
                          >
                            {session ? (
                              <SessionBlock
                                session={session}
                                renderSession={renderSession}
                                onClick={onSelectSession}
                                interval={interval}
                                zoomLevel={zoomLevel}
                              />
                            ) : null}
                          </Timeslot>
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
  slot: TimeSlot;
  selectable: boolean;
  zoomLevel: number;
  selector: TimeSlotSelector;
  children: ReactNode;
};

function Timeslot({ trackId, slot, selectable, zoomLevel, selector, children }: TimeslotProps) {
  const id = `${trackId}-${formatTime(slot.start)}`;

  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { type: 'timeslot', trackId, timeslot: slot },
  });

  const isSelected = selector.isSelectedSlot(trackId, slot);

  return (
    <div
      ref={setNodeRef}
      onMouseDown={selectable ? selector.onSelectStart(trackId, slot) : undefined}
      onMouseEnter={selectable ? selector.onSelectHover(trackId, slot) : undefined}
      onMouseUp={selector.onSelect}
      style={{ height: `${getTimeslotHeight(zoomLevel)}px` }}
      className={cx('relative', {
        'hover:bg-gray-50': selectable && !isSelected,
        'bg-blue-50': (selectable && isSelected) || isOver,
      })}
    >
      {children}
    </div>
  );
}

type SessionProps = {
  session: Session;
  renderSession: (session: Session, zoomLevel: number, oneLine: boolean) => ReactNode;
  onClick: (session: Session) => void;
  interval: number;
  zoomLevel: number;
};

function SessionBlock({ session, renderSession, onClick, interval, zoomLevel }: SessionProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: session.id, data: { session } });

  const totalTimeMinutes = totalTimeInMinutes(session.timeslot);
  const intervalsCount = countIntervalsInTimeSlot(session.timeslot, interval);

  const height = getTimeslotHeight(zoomLevel) * intervalsCount + Math.ceil(totalTimeMinutes / HOUR_INTERVAL) - 3;
  const style = {
    top: '1px',
    left: '1px',
    right: '1px',
    height: `${height}px`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: transform ? '40' : undefined,
  };

  return (
    <button
      ref={setNodeRef}
      className="absolute z-20 overflow-hidden text-left"
      onClick={() => onClick(session)}
      style={style}
      {...listeners}
      {...attributes}
    >
      {renderSession(session, zoomLevel, intervalsCount === 1)}
    </button>
  );
}

function getTimeslotHeight(zoomLevel: number) {
  if (zoomLevel >= 0 && zoomLevel < TIMESLOT_HEIGHTS.length) {
    return TIMESLOT_HEIGHTS[zoomLevel];
  }
  return TIMESLOT_HEIGHTS[DEFAULT_ZOOM_LEVEL];
}

// Custom collision detection function
const customCollisionDetection: CollisionDetection = (args) => {
  const { droppableContainers, collisionRect } = args;

  // Check for collisions prioritizing the top of droppable elements
  const prioritizedCollisions = droppableContainers.filter(({ rect }) => {
    if (!rect.current) return false;
    return collisionRect.top >= rect.current.top && collisionRect.top <= rect.current.bottom;
  });

  // If no collisions were found, fallback to the default closestCenter strategy
  if (prioritizedCollisions.length === 0) {
    return closestCenter(args);
  }

  return rectIntersection({ ...args, droppableContainers: prioritizedCollisions });
};
