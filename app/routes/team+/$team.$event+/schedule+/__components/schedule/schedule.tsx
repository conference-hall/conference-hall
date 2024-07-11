import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { cx } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { v4 as uuid } from 'uuid';

import { useSessions } from './hooks/use-sessions.tsx';
import type { TimeSlotSelector } from './hooks/use-timeslot-selector.tsx';
import { useTimeslotSelector } from './hooks/use-timeslot-selector.tsx';
import type { Session, TimeSlot, Track } from './types.ts';
import {
  countIntervalsInTimeSlot,
  extractTimeSlots,
  formatTime,
  generateTimeSlots,
  totalTimeInMinutes,
} from './utils/timeslots.ts';

const HOUR_INTERVAL = 60; // minutes
const SLOT_INTERVAL = 10; // minutes
const TIMESLOT_HEIGHTS = [8, 12, 16, 20]; // px
const DEFAULT_ZOOM_LEVEL = 1;
const DEFAULT_TRACK: Track = { id: 'track-1', name: 'Track' };

type ScheduleProps = {
  startTime: string;
  endTime: string;
  interval?: number;
  tracks: Array<Track>;
  initialSessions: Array<Session>;
  renderSession: (session: Session, zoomLevel: number, oneLine: boolean) => ReactNode;
  onAddSession: (session: Session) => void;
  onSelectSession: (session: Session) => void;
  zoomLevel?: number;
};

export default function Schedule({
  startTime,
  endTime,
  interval = SLOT_INTERVAL,
  tracks = [DEFAULT_TRACK],
  initialSessions = [],
  renderSession,
  onAddSession,
  onSelectSession,
  zoomLevel = DEFAULT_ZOOM_LEVEL,
}: ScheduleProps) {
  const hours = generateTimeSlots(startTime, endTime, HOUR_INTERVAL);
  const slots = generateTimeSlots(startTime, endTime, interval);

  const sessions = useSessions(initialSessions);

  const handleAddSession = (trackId: string, timeslot: TimeSlot) => {
    const session = { id: uuid(), trackId, timeslot };
    const added = sessions.addSession(session);
    if (added) onAddSession(session);
  };

  const selector = useTimeslotSelector(handleAddSession);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over?.data?.current?.type === 'timeslot') {
      const { trackId, timeslot } = over.data.current || {};
      const { session } = active.data.current || {};
      sessions.moveSession(session, trackId, timeslot);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
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
              const hourSlots = extractTimeSlots(slots, startTime, endTime);

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
    disabled: !selectable,
    data: { type: 'timeslot', trackId, timeslot: slot },
  });

  const isSelected = selector.isSelectedSlot(trackId, slot);

  const style = {
    height: `${getTimeslotHeight(zoomLevel)}px`,
    backgroundColor: isOver ? 'red' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      onMouseDown={selectable ? selector.onSelectStart(trackId, slot) : undefined}
      onMouseEnter={selectable ? selector.onSelectHover(trackId, slot) : undefined}
      onMouseUp={selector.onSelect}
      style={style}
      className={cx('relative', {
        'hover:bg-gray-50': selectable && !isSelected,
        'bg-blue-50': selectable && isSelected,
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
