import { cx } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { useSessions } from './hooks/use-sessions.tsx';
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
const TIMESLOT_HEIGHTS = [12, 16, 20, 26, 32]; // px
const DEFAULT_TIMESLOT_HEIGHT_IDX = 2;
const DEFAULT_TRACK: Track = { id: 'track-1', name: 'Track' };

type ScheduleProps = {
  startTime: string;
  endTime: string;
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
  tracks = [DEFAULT_TRACK],
  initialSessions = [],
  renderSession,
  onAddSession,
  onSelectSession,
  zoomLevel = DEFAULT_TIMESLOT_HEIGHT_IDX,
}: ScheduleProps) {
  const hours = generateTimeSlots(startTime, endTime, HOUR_INTERVAL);
  const slots = generateTimeSlots(startTime, endTime, SLOT_INTERVAL);

  const sessions = useSessions(initialSessions);

  const handleAddSession = (trackId: string, timeslot: TimeSlot) => {
    const added = sessions.addSession(trackId, timeslot);
    if (added) onAddSession({ trackId, timeslot });
  };

  const selector = useTimeslotSelector(handleAddSession);

  return (
    <div className={cx('w-full border-t border-gray-200 overflow-hidden', { 'select-none': selector.isSelecting })}>
      <table className="min-w-full border-separate border-spacing-0 overflow-x-auto">
        {/* Gutter */}
        <thead>
          <tr className="sticky top-0 z-40 divide-x divide-gray-200 shadow">
            <th scope="col" className="w-6 p-3 bg-white text-left text-sm font-semibold text-gray-900"></th>
            {tracks.map((track) => (
              <th key={track.id} scope="col" className="p-3 bg-white text-center text-sm font-semibold text-gray-900">
                {track.name}
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
                      const startTime = formatTime(slot.start);
                      const endTime = formatTime(slot.end);
                      const isSelected = selector.isSelectedSlot(track.id, slot);
                      const selectable = !sessions.hasSession(track.id, slot);
                      const session = sessions.getSession(track.id, slot);

                      return (
                        <div
                          key={`${startTime}-${endTime}`}
                          onMouseDown={selectable ? selector.onSelectStart(track.id, slot) : undefined}
                          onMouseEnter={selectable ? selector.onSelectHover(track.id, slot) : undefined}
                          onMouseUp={selector.onSelect}
                          className={cx('relative', {
                            'hover:bg-gray-50 cursor-pointer': selectable && !isSelected,
                            'bg-blue-50 cursor-pointer': selectable && isSelected,
                          })}
                          style={{ height: `${getTimeslotHeight(zoomLevel)}px` }}
                        >
                          {session ? (
                            <SessionBlock
                              session={session}
                              renderSession={renderSession}
                              onClick={onSelectSession}
                              zoomLevel={zoomLevel}
                            />
                          ) : null}
                        </div>
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

type SessionProps = {
  session: Session;
  renderSession: (session: Session, zoomLevel: number, oneLine: boolean) => ReactNode;
  onClick: (session: Session) => void;
  zoomLevel: number;
};

function SessionBlock({ session, renderSession, onClick, zoomLevel }: SessionProps) {
  const totalTimeMinutes = totalTimeInMinutes(session.timeslot);
  const intervalsCount = countIntervalsInTimeSlot(session.timeslot, SLOT_INTERVAL);

  const height = getTimeslotHeight(zoomLevel) * intervalsCount + Math.ceil(totalTimeMinutes / HOUR_INTERVAL) - 3;

  return (
    <div
      className="absolute z-20 overflow-hidden cursor-pointer"
      style={{ top: '1px', left: '1px', right: '1px', height: `${height}px` }}
      onClick={() => onClick(session)}
    >
      {renderSession(session, zoomLevel, intervalsCount === 1)}
    </div>
  );
}

function getTimeslotHeight(zoomLevel: number) {
  if (zoomLevel >= 0 && zoomLevel < TIMESLOT_HEIGHTS.length) {
    return TIMESLOT_HEIGHTS[zoomLevel];
  }
  return TIMESLOT_HEIGHTS[DEFAULT_TIMESLOT_HEIGHT_IDX];
}
