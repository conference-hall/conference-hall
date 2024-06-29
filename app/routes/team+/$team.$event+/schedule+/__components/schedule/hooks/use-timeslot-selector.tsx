import { useState } from 'react';

import type { TimeSlot } from '../types.ts';
import { getFullTimeslot, isTimeSlotIncluded } from '../utils/timeslots.ts';

export function useTimeslotSelector(onSelectTimeslot: (trackId: string, timeslot: TimeSlot) => void) {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  const [startSlot, setStartSlot] = useState<TimeSlot | null>(null);
  const [currentSlot, setCurrentSlot] = useState<TimeSlot | null>(null);

  const reset = () => {
    setSelectedTrack(null);
    setStartSlot(null);
    setCurrentSlot(null);
  };

  const isSelecting = Boolean(startSlot);

  const isSelectedSlot = (trackId: string, slot: TimeSlot) => {
    if (startSlot === null || selectedTrack !== trackId) return false;
    if (currentSlot === null) return false;
    const timeslot = getFullTimeslot(startSlot, currentSlot);
    return isTimeSlotIncluded(slot, timeslot);
  };

  const onSelectStart = (trackId: string, slot: TimeSlot) => () => {
    reset();
    setSelectedTrack(trackId);
    setStartSlot(slot);
  };

  const onSelectHover = (trackId: string, slot: TimeSlot) => () => {
    if (startSlot === null || selectedTrack !== trackId) return;
    setCurrentSlot(slot);
  };

  const onSelect = () => {
    if (startSlot === null || selectedTrack === null) return reset();
    const timeslot = getFullTimeslot(startSlot, currentSlot || startSlot);
    onSelectTimeslot(selectedTrack, timeslot);
    reset();
  };

  return { isSelecting, isSelectedSlot, onSelectStart, onSelectHover, onSelect };
}
