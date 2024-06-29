import { useState } from 'react';

import { formatTime, isAfterTimeSlot, isEqualTimeSlot, isTimeSlotIncluded, type TimeSlot } from './timeslots.ts';

export function useTimeslotSelector() {
  const [startTrack, setStartTrack] = useState<number | null>(null);

  const [startSlot, setStartSlot] = useState<TimeSlot | null>(null);
  const [currentSlot, setCurrentSlot] = useState<TimeSlot | null>(null);
  const [endSlot, setEndSlot] = useState<TimeSlot | null>(null);

  const reset = () => {
    console.log('reset');
    setStartTrack(null);
    setStartSlot(null);
    setCurrentSlot(null);
    setEndSlot(null);
  };

  const isSelectedSlot = (track: number, slot: TimeSlot) => {
    if (startSlot === null || startTrack !== track) return false;
    if (endSlot !== null) return isTimeSlotIncluded(slot, startSlot, endSlot);
    if (currentSlot !== null) return isTimeSlotIncluded(slot, startSlot, currentSlot);
    return false;
  };

  const onSelectStart = (track: number, slot: TimeSlot) => () => {
    console.log('start', track, slot);
    reset();
    setStartTrack(track);
    setStartSlot(slot);
  };

  const onSelectHover = (track: number, slot: TimeSlot) => () => {
    if (startSlot === null || startTrack !== track) return;
    if (endSlot !== null) return;
    if (isEqualTimeSlot(startSlot, slot) || isAfterTimeSlot(slot, startSlot)) {
      console.log('over', track, slot);
      setCurrentSlot(slot);
    }
  };

  const onSelect = () => {
    if (startSlot === null || startTrack === null) return reset();

    const slot = currentSlot || startSlot;

    console.log('selected', startTrack, formatTime(startSlot.start), formatTime(slot.end));
    setCurrentSlot(slot);
    setEndSlot(slot);
  };

  return { isSelectedSlot, onSelectStart, onSelectHover, onSelect };
}
