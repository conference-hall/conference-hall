import { useState } from 'react';

import type { TimeSlot } from '../schedule.types.ts';
import { getFullTimeslot, isAfterTimeSlot, isTimeSlotIncluded } from './timeslots.ts';

export type TimeSlotSelector = {
  isSelecting: boolean;
  getSelectedSlot: (trackId: string) => TimeSlot | null;
  isSelectedSlot: (trackId: string, slot: TimeSlot) => boolean;
  onSelectStart: (trackId: string, slot: TimeSlot) => () => void;
  onSelectHover: (trackId: string, slot: TimeSlot) => () => void;
  onSelect: () => void;
};

export function useTimeslotSelector(onSelectTimeslot: (trackId: string, timeslot: TimeSlot) => void): TimeSlotSelector {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  const [startSlot, setStartSlot] = useState<TimeSlot | null>(null);
  const [currentSlot, setCurrentSlot] = useState<TimeSlot | null>(null);

  const reset = () => {
    setSelectedTrack(null);
    setStartSlot(null);
    setCurrentSlot(null);
  };

  const isSelecting = Boolean(startSlot);

  const getSelectedSlot = (trackId: string) => {
    if (!startSlot) return null;
    if (!currentSlot) return null;
    if (trackId !== selectedTrack) return null;
    if (isAfterTimeSlot(startSlot, currentSlot)) {
      return { start: currentSlot?.start || startSlot.start, end: startSlot.end };
    } else {
      return { start: startSlot.start, end: currentSlot?.end || startSlot.end };
    }
  };

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

  return { isSelecting, getSelectedSlot, isSelectedSlot, onSelectStart, onSelectHover, onSelect };
}
