import { cx } from 'class-variance-authority';
import { useState } from 'react';

import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';

import type { Session } from './utils/sessions.ts';
import type { TimeSlot } from './utils/timeslots.ts';
import {
  areTimeSlotsOverlapping,
  countIntervalsInTimeSlot,
  extractTimeSlots,
  formatTime,
  formatTimeSlot,
  generateTimeSlots,
  haveSameStartDate,
  isTimeSlotIncluded,
  totalTimeInMinutes,
} from './utils/timeslots.ts';
import { useTimeslotSelector } from './utils/use-timeslot-selector.tsx';

const HOUR_INTERVAL = 60; // minutes
const SLOT_INTERVAL = 10; // minutes
const TIMESLOT_HEIGHT = 24; // px
const SESSION_MIN_HEIGHT = 24; // px

export default function Schedule() {
  const startTimeline = '09:00';
  const endTimeline = '18:00';
  const hours = generateTimeSlots(startTimeline, endTimeline, HOUR_INTERVAL);
  const slots = generateTimeSlots(startTimeline, endTimeline, SLOT_INTERVAL);

  const [tracks, setTrack] = useState(['', '', '']);
  const addTrack = () => setTrack((r) => [...r, '']);

  const [sessions, setSession] = useState<Array<Session>>([]);

  const addSession = (track: number, timeslot: TimeSlot) => {
    const conflicting = sessions.some(
      (session) => session.track === track && areTimeSlotsOverlapping(timeslot, session.timeslot),
    );
    if (conflicting) return;
    console.log('Track', track, formatTimeSlot(timeslot));
    setSession((s) => [...s, { track, timeslot }]);
  };

  const getSession = (track: number, timeslot: TimeSlot) => {
    return sessions.find((session) => session.track === track && haveSameStartDate(session.timeslot, timeslot));
  };

  const hasSession = (track: number, timeslot: TimeSlot) => {
    return sessions.some((session) => session.track === track && isTimeSlotIncluded(timeslot, session.timeslot));
  };

  const selector = useTimeslotSelector(addSession);

  return (
    <Card>
      <div className="flex flex-row gap-4">
        <Button onClick={addTrack}>Add room</Button>
      </div>
      <div className="flow-root select-none">
        <div className="inline-block min-w-full">
          <table className="min-w-full border-separate border-spacing-0">
            {/* Gutter */}
            <thead>
              <tr className="divide-x divide-gray-200">
                <th
                  scope="col"
                  className="sticky top-0 z-10 w-6 border-b border-gray-300 text-left text-sm font-semibold text-gray-900"
                >
                  Time
                </th>
                {tracks.map((_, trackIndex) => (
                  <th
                    key={trackIndex}
                    scope="col"
                    className="sticky top-0 z-10 border-b border-gray-300 text-left text-sm font-semibold text-gray-900 table-cell"
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
                    <td className="border-b border-gray-200 whitespace-nowrap text-sm font-medium text-gray-900 table-cell">
                      {startTime}
                    </td>

                    {/* Rows by track */}
                    {tracks.map((_, trackIndex) => (
                      <td key={trackIndex} className="border-b border-gray-200 table-cell">
                        {hourSlots.map((slot) => {
                          const startTime = formatTime(slot.start);
                          const endTime = formatTime(slot.end);
                          const isSelected = selector.isSelectedSlot(trackIndex, slot);
                          const selectable = !hasSession(trackIndex, slot);
                          const session = getSession(trackIndex, slot);

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
                              {session ? <SessionBlock session={session} /> : null}
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
    </Card>
  );
}

type SessionProps = { session: Session };

function SessionBlock({ session }: SessionProps) {
  const totalTimeMinutes = totalTimeInMinutes(session.timeslot);
  const intervalsCount = countIntervalsInTimeSlot(session.timeslot, SLOT_INTERVAL);

  const height = Math.max(
    TIMESLOT_HEIGHT * intervalsCount + (Math.ceil(totalTimeMinutes / HOUR_INTERVAL) - 1) * 3,
    SESSION_MIN_HEIGHT,
  );

  return (
    <div
      className="absolute top-0 left-0 right-0 p-1 text-xs overflow-hidden bg-red-50 border border-red-200 rounded"
      style={{ height: `${height}px` }}
    >
      <p className="text-red-400 truncate">{formatTimeSlot(session.timeslot)}</p>
      <p className="text-red-400 truncate">This is a session name, This is a session name, This is a session name</p>
    </div>
  );
}
