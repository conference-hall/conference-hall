import { addMinutes, differenceInMinutes, format, isAfter, isBefore, isEqual, parse } from 'date-fns';

export type TimeSlot = {
  start: Date;
  end: Date;
};

export const generateTimes = (startTime: string, endTime: string, durationMinutes: number = 5): Array<string> => {
  const times: Array<string> = [];
  let [currentHour, currentMinute] = startTime.split(':').map(Number);

  const [endHour, endMinute] = endTime.split(':').map(Number);

  while (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
    const time = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    times.push(time);
    currentMinute += durationMinutes;

    if (currentMinute >= 60) {
      currentMinute -= 60;
      currentHour += 1;
    }
  }

  return times;
};

export const generateTimeSlots = (startTime: string, endTime: string, durationMinutes: number = 5): Array<TimeSlot> => {
  const slots: Array<TimeSlot> = [];
  let currentTime = parse(startTime, 'HH:mm', new Date());
  const endTimeParsed = parse(endTime, 'HH:mm', new Date());

  while (isBefore(currentTime, endTimeParsed)) {
    const nextTime = addMinutes(currentTime, durationMinutes);
    if (isAfter(nextTime, endTimeParsed)) break;
    slots.push({ start: currentTime, end: nextTime });
    currentTime = nextTime;
  }

  return slots;
};

export const totalTimeInMinutes = (slot: TimeSlot): number => {
  return differenceInMinutes(slot.end, slot.start);
};

export const isEqualTimeSlot = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  return isEqual(slot1.start, slot2.start) && isEqual(slot1.end, slot2.end);
};

export const isAfterTimeSlot = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  return isAfter(slot1.start, slot2.start);
};

export const isBeforeTimeSlot = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  return isBefore(slot1.start, slot2.start);
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

export const isTimeSlotIncludedBetween = (slot: TimeSlot, startTime: Date, endTime: Date): boolean => {
  return (
    (isAfter(slot.start, startTime) || isEqual(slot.start, startTime)) &&
    (isBefore(slot.end, endTime) || isEqual(slot.end, endTime))
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

export const extractTimeSlots = (slots: Array<TimeSlot>, startTime: string, endTime: string): Array<TimeSlot> => {
  const start = parse(startTime, 'HH:mm', new Date());
  const end = parse(endTime, 'HH:mm', new Date());
  return slots.filter((slot) => {
    return (
      (isAfter(slot.start, start) || isEqual(slot.start, start)) && (isBefore(slot.end, end) || isEqual(slot.end, end))
    );
  });
};

export const getFullTimeslot = (slot1: TimeSlot, slot2: TimeSlot) => {
  if (isAfterTimeSlot(slot1, slot2)) return { start: slot2.start, end: slot1.end };
  return { start: slot1.start, end: slot2.end };
};

export const formatTime = (time: Date, formatStr: string = 'HH:mm'): string => {
  return format(time, formatStr);
};

export const formatTimeSlot = (slot: TimeSlot, formatStr: string = 'HH:mm'): string => {
  const formattedStart = format(slot.start, formatStr);
  const formattedEnd = format(slot.end, formatStr);
  return `${formattedStart} - ${formattedEnd}`;
};
