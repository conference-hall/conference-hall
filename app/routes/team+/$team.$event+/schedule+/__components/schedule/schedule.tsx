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
const TIMESLOT_HEIGHT = 26; // px
const DEFAULT_TRACK: Track = { id: 'track-1', name: 'Track' };

type ScheduleProps = {
  startTime: string;
  endTime: string;
  tracks: Array<Track>;
  initialSessions: Array<Session>;
  renderSession: (session: Session, oneLine: boolean) => ReactNode;
  onAddSession: (session: Session) => void;
  onSelectSession: (session: Session) => void;
};

export default function Schedule({
  startTime,
  endTime,
  tracks = [DEFAULT_TRACK],
  initialSessions = [],
  renderSession,
  onAddSession,
  onSelectSession,
}: ScheduleProps) {
  const hours = generateTimeSlots(startTime, endTime, HOUR_INTERVAL);
  const slots = generateTimeSlots(startTime, endTime, SLOT_INTERVAL);

  const sessions = useSessions(initialSessions);

  const handleAddSession = (track: number, timeslot: TimeSlot) => {
    sessions.addSession(track, timeslot);
    onAddSession({ track, timeslot });
  };

  const selector = useTimeslotSelector(handleAddSession);

  return (
    <div className="flow-root select-none">
      <div className="inline-block min-w-full">
        <table className="min-w-full border-collapse">
          {/* Gutter */}
          <thead>
            <tr className="divide-x divide-gray-200">
              <th
                scope="col"
                className="sticky top-0 z-40 p-0 bg-white w-6 border-b border-gray-300 text-left text-sm font-semibold text-gray-900"
              >
                Time
              </th>
              {tracks.map((track) => (
                <th
                  key={track.id}
                  scope="col"
                  className="sticky top-0 z-40 p-0 bg-white border-b border-gray-300 text-left text-sm font-semibold text-gray-900 table-cell"
                >
                  Room
                </th>
              ))}
            </tr>
          </thead>

          {/* Content */}
          <tbody>
            {/* Hours */}
            {hours.map((hour) => {
              const startTime = formatTime(hour.start);
              const endTime = formatTime(hour.end);
              const hourSlots = extractTimeSlots(slots, startTime, endTime);

              return (
                <tr key={`${startTime}-${endTime}`} className="divide-x divide-gray-200 align-top">
                  {/* Gutter time */}
                  <td className="p-0 border-b border-gray-200 whitespace-nowrap text-sm font-medium text-gray-900">
                    {startTime}
                  </td>

                  {/* Rows by track */}
                  {tracks.map((_, trackIndex) => (
                    <td key={trackIndex} className="p-0 border-b border-gray-200">
                      {hourSlots.map((slot) => {
                        const startTime = formatTime(slot.start);
                        const endTime = formatTime(slot.end);
                        const isSelected = selector.isSelectedSlot(trackIndex, slot);
                        const selectable = !sessions.hasSession(trackIndex, slot);
                        const session = sessions.getSession(trackIndex, slot);

                        return (
                          <div
                            key={`${startTime}-${endTime}`}
                            onMouseDown={selectable ? selector.onSelectStart(trackIndex, slot) : undefined}
                            onMouseEnter={selectable ? selector.onSelectHover(trackIndex, slot) : undefined}
                            onMouseUp={selector.onSelect}
                            className={cx('relative', {
                              'hover:bg-gray-50 cursor-pointer': selectable && !isSelected,
                              'bg-blue-50 cursor-pointer': selectable && isSelected,
                            })}
                            style={{ height: `${TIMESLOT_HEIGHT}px` }}
                          >
                            {session ? (
                              <SessionBlock session={session} renderSession={renderSession} onClick={onSelectSession} />
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
    </div>
  );
}

type SessionProps = {
  session: Session;
  renderSession: (session: Session, oneLine: boolean) => ReactNode;
  onClick: (session: Session) => void;
};

function SessionBlock({ session, renderSession, onClick }: SessionProps) {
  const totalTimeMinutes = totalTimeInMinutes(session.timeslot);
  const intervalsCount = countIntervalsInTimeSlot(session.timeslot, SLOT_INTERVAL);

  const height = TIMESLOT_HEIGHT * intervalsCount + Math.ceil(totalTimeMinutes / HOUR_INTERVAL) - 3;

  return (
    <div
      className="absolute z-20 overflow-hidden cursor-pointer"
      style={{ top: '1px', left: '1px', right: '1px', height: `${height}px` }}
      onClick={() => onClick(session)}
    >
      {renderSession(session, intervalsCount === 1)}
    </div>
  );
}
