import { cx } from 'class-variance-authority';
import { useState } from 'react';

import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';

import { extractTimeSlots, formatTime, generateTimeSlots } from './utils/timeslots.ts';
import { useTimeslotSelector } from './utils/use-timeslot-selector.tsx';

export default function Schedule() {
  const startTimeline = '09:00';
  const endTimeline = '18:00';
  const hours = generateTimeSlots(startTimeline, endTimeline, 60);
  const slots = generateTimeSlots(startTimeline, endTimeline, 5);

  const [tracks, setTrack] = useState(['', '', '']);
  const addTrack = () => setTrack((r) => [...r, '']);

  const selector = useTimeslotSelector();

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

                          return (
                            <div
                              key={`${startTime}-${endTime}`}
                              onMouseDown={selector.onSelectStart(trackIndex, slot)}
                              onMouseEnter={selector.onSelectHover(trackIndex, slot)}
                              onMouseUp={selector.onSelect}
                              className={cx('h-2 cursor-pointer relative', {
                                'hover:bg-gray-50': !isSelected,
                                'bg-blue-50': isSelected,
                              })}
                            ></div>
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
