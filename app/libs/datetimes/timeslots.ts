import { addMinutes, differenceInMinutes, endOfDay, isAfter, isBefore, isEqual, startOfDay } from 'date-fns';

export type TimeSlot = { start: Date; end: Date };

export const getDailyTimeSlots = (
  start: Date,
  end: Date,
  intervalMinutes: number,
  includeEndSlot = false,
): Array<TimeSlot> => {
  const timeSlots = generateDailyTimeSlots(start, intervalMinutes);

  const result = timeSlots.filter((slot) => {
    if (includeEndSlot) {
      return (
        (isAfter(slot.start, start) || isEqual(slot.start, start)) &&
        (isBefore(slot.start, end) || isEqual(slot.start, end))
      );
    } else {
      return (
        (isAfter(slot.start, start) || isEqual(slot.start, start)) &&
        (isBefore(slot.end, end) || isEqual(slot.end, end))
      );
    }
  });

  return result;
};

const generateDailyTimeSlots = (day: Date, intervalMinutes: number): Array<TimeSlot> => {
  const start = startOfDay(day); // 00:00 of the current day
  const end = endOfDay(day); // 23:59 of the current day

  const timeSlots: Array<TimeSlot> = [];

  let currentStart = start;

  while (isBefore(currentStart, end) || isEqual(currentStart, end)) {
    const currentEnd = addMinutes(currentStart, intervalMinutes);
    if (isAfter(currentEnd, end)) {
      timeSlots.push({ start: currentStart, end });
      break;
    }
    timeSlots.push({ start: currentStart, end: currentEnd });
    currentStart = currentEnd;
  }

  return timeSlots;
};

export const totalTimeInMinutes = (slot: TimeSlot): number => {
  return differenceInMinutes(slot.end, slot.start);
};

export const isAfterTimeSlot = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  return isAfter(slot1.start, slot2.start);
};

export const haveSameStartDate = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  return isEqual(slot1.start, slot2.start);
};

export const isTimeSlotIncluded = (slot: TimeSlot, inSlot?: TimeSlot): boolean => {
  if (!inSlot) return false;
  return (
    (isAfter(slot.start, inSlot.start) || isEqual(slot.start, inSlot.start)) &&
    (isBefore(slot.end, inSlot.end) || isEqual(slot.end, inSlot.end))
  );
};

export const areTimeSlotsOverlapping = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  return !(
    isBefore(slot1.end, slot2.start) ||
    isEqual(slot1.end, slot2.start) ||
    isAfter(slot1.start, slot2.end) ||
    isEqual(slot1.start, slot2.end)
  );
};

export const countIntervalsInTimeSlot = (slot: TimeSlot, intervalMinutes: number): number => {
  const durationInMinutes = differenceInMinutes(slot.end, slot.start);
  return Math.floor(durationInMinutes / intervalMinutes);
};

export const moveTimeSlotStart = (slot: TimeSlot, newStart: Date): TimeSlot => {
  const durationInMinutes = differenceInMinutes(slot.end, slot.start);
  const newEnd = addMinutes(newStart, durationInMinutes);
  return { start: newStart, end: newEnd };
};

export const mergeTimeslots = (slot1: TimeSlot, slot2: TimeSlot) => {
  if (isAfterTimeSlot(slot1, slot2)) return { start: slot2.start, end: slot1.end };
  return { start: slot1.start, end: slot2.end };
};
