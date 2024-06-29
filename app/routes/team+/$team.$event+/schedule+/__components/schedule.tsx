import { cx } from 'class-variance-authority';
import { useState } from 'react';

import { Button } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';

import type { TimeSlot } from './utils/timeslots.ts';
import {
  extractTimeSlots,
  formatTime,
  generateTimeSlots,
  isAfterTimeSlot,
  isEqualTimeSlot,
  isTimeSlotIncluded,
} from './utils/timeslots.ts';

export default function Schedule() {
  const [tracks, setTrack] = useState(['', '', '']);
  const addTrack = () => setTrack((r) => [...r, '']);

  const [startTrack, setStartTrack] = useState<number | null>(null);
  const [startSlot, setStartSlot] = useState<TimeSlot | null>(null);

  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [currentSlot, setCurrentSlot] = useState<TimeSlot | null>(null);

  const [endTrack, setEndTrack] = useState<number | null>(null);
  const [endSlot, setEndSlot] = useState<TimeSlot | null>(null);

  const reset = () => {
    console.log('reset');
    setStartTrack(null);
    setStartSlot(null);
    setCurrentTrack(null);
    setCurrentSlot(null);
    setEndTrack(null);
    setEndSlot(null);
  };

  const isSelectedSlot = (track: number, slot: TimeSlot) => {
    if (startSlot === null || startTrack !== track) return false;
    if (currentSlot === null || currentTrack !== track) return false;

    if (endSlot !== null) return isTimeSlotIncluded(slot, startSlot, endSlot);
    return isTimeSlotIncluded(slot, startSlot, currentSlot);
  };

  const start = '09:00';
  const end = '18:00';
  const hours = generateTimeSlots(start, end, 60);
  const slots = generateTimeSlots(start, end, 5);

  const onMouseDown = (track: number, slot: TimeSlot) => () => {
    console.log('start', track, slot);
    reset();
    setStartTrack(track);
    setStartSlot(slot);
  };

  const onMouseEnter = (track: number, slot: TimeSlot) => () => {
    if (startSlot === null || startTrack !== track) return;
    if (endSlot !== null || endTrack !== null) return;
    if (isEqualTimeSlot(startSlot, slot) || isAfterTimeSlot(slot, startSlot)) {
      console.log('over', track, slot);
      setCurrentTrack(track);
      setCurrentSlot(slot);
    }
  };

  const onMouseUp = () => {
    if (startSlot === null) return reset();

    const slot = currentSlot || startSlot;
    const track = currentTrack || startTrack;

    console.log('selected', startTrack, formatTime(startSlot.start), formatTime(slot.end));
    setCurrentTrack(track);
    setCurrentSlot(slot);
    setEndTrack(track);
    setEndSlot(slot);
  };

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
                          const isSelected = isSelectedSlot(trackIndex, slot);

                          return (
                            <div
                              key={`${startTime}-${endTime}`}
                              onMouseDown={onMouseDown(trackIndex, slot)}
                              onMouseEnter={onMouseEnter(trackIndex, slot)}
                              onMouseUp={onMouseUp}
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
