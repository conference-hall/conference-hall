import { useState } from 'react';

import type { TimeSlot } from '../types.ts';
import { getFullTimeslot, isTimeSlotIncluded } from '../utils/timeslots.ts';

export function useTimeslotSelector(onSelectTimeslot: (track: number, timeslot: TimeSlot) => void) {
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);

  const [startSlot, setStartSlot] = useState<TimeSlot | null>(null);
  const [currentSlot, setCurrentSlot] = useState<TimeSlot | null>(null);

  const reset = () => {
    setSelectedTrack(null);
    setStartSlot(null);
    setCurrentSlot(null);
  };

  const isSelectedSlot = (track: number, slot: TimeSlot) => {
    if (startSlot === null || selectedTrack !== track) return false;
    if (currentSlot === null) return false;
    const timeslot = getFullTimeslot(startSlot, currentSlot);
    return isTimeSlotIncluded(slot, timeslot);
  };

  const onSelectStart = (track: number, slot: TimeSlot) => () => {
    reset();
    setSelectedTrack(track);
    setStartSlot(slot);
  };

  const onSelectHover = (track: number, slot: TimeSlot) => () => {
    if (startSlot === null || selectedTrack !== track) return;
    setCurrentSlot(slot);
  };

  const onSelect = () => {
    if (startSlot === null || selectedTrack === null) return reset();
    const timeslot = getFullTimeslot(startSlot, currentSlot || startSlot);
    onSelectTimeslot(selectedTrack, timeslot);
    reset();
  };

  return { isSelectedSlot, onSelectStart, onSelectHover, onSelect };
}
