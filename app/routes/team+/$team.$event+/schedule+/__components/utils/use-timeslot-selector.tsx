import { useCallback, useMemo, useState } from 'react';

import { formatTimeSlot, getFullTimeslot, isTimeSlotIncludedBetween, type TimeSlot } from './timeslots.ts';

export function useTimeslotSelector() {
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);

  const [startSlot, setStartSlot] = useState<TimeSlot | null>(null);
  const [currentSlot, setCurrentSlot] = useState<TimeSlot | null>(null);

  const reset = useCallback(() => {
    setSelectedTrack(null);
    setStartSlot(null);
    setCurrentSlot(null);
  }, []);

  const isSelectedSlot = useCallback(
    (track: number, slot: TimeSlot) => {
      if (startSlot === null || selectedTrack !== track) return false;
      if (currentSlot === null) return false;
      const timeslot = getFullTimeslot(startSlot, currentSlot);
      return isTimeSlotIncludedBetween(slot, timeslot.start, timeslot.end);
    },
    [startSlot, currentSlot, selectedTrack],
  );

  const onSelectStart = useCallback(
    (track: number, slot: TimeSlot) => () => {
      reset();
      setSelectedTrack(track);
      setStartSlot(slot);
    },
    [reset],
  );

  const onSelectHover = useCallback(
    (track: number, slot: TimeSlot) => () => {
      if (startSlot === null || selectedTrack !== track) return;
      setCurrentSlot(slot);
    },
    [startSlot, selectedTrack],
  );

  const onSelect = useCallback(() => {
    if (startSlot === null || selectedTrack === null) return reset();
    const timeslot = getFullTimeslot(startSlot, currentSlot || startSlot);
    console.log('Track', selectedTrack, formatTimeSlot(timeslot));
    reset();
  }, [startSlot, currentSlot, selectedTrack, reset]);

  return useMemo(
    () => ({ isSelectedSlot, onSelectStart, onSelectHover, onSelect }),
    [isSelectedSlot, onSelectStart, onSelectHover, onSelect],
  );
}
