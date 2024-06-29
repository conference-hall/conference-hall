import { isAfter } from 'date-fns';
import { useState } from 'react';

import { formatTime, isTimeSlotIncludedBetween, type TimeSlot } from './timeslots.ts';

export function useTimeslotSelector() {
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);

  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  const reset = () => {
    console.log('reset');
    setSelectedTrack(null);
    setStartTime(null);
    setCurrentTime(null);
  };

  const getSortedTimes = (start: Date, end: Date) => {
    if (isAfter(start, end)) return { start: end, end: start };
    return { start, end };
  };

  const isSelectedSlot = (track: number, slot: TimeSlot) => {
    if (startTime === null || selectedTrack !== track) return false;
    if (currentTime === null) return false;
    const { start, end } = getSortedTimes(startTime, currentTime);
    return isTimeSlotIncludedBetween(slot, start, end);
  };

  const onSelectStart = (track: number, start: Date) => () => {
    console.log('start', track, start);
    reset();
    setSelectedTrack(track);
    setStartTime(start);
  };

  const onSelectHover = (track: number, end: Date) => () => {
    if (startTime === null || selectedTrack !== track) return;
    console.log('over', track, end);
    setCurrentTime(end);
  };

  const onSelect = () => {
    if (startTime === null || selectedTrack === null) return reset();
    const { start, end } = getSortedTimes(startTime, currentTime || startTime);
    console.log('selected', selectedTrack, formatTime(start), formatTime(end));
    reset();
  };

  return { isSelectedSlot, onSelectStart, onSelectHover, onSelect };
}
