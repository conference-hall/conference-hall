import { addMinutes, format, isAfter, isBefore, isEqual, parse } from 'date-fns';

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

export const isEqualTimeSlot = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  return isEqual(slot1.start, slot2.start) && isEqual(slot1.end, slot2.end);
};

export const isAfterTimeSlot = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  return isAfter(slot1.start, slot2.start);
};

export const isBeforeTimeSlot = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  return isBefore(slot1.start, slot2.start);
};

export const isTimeSlotIncluded = (slot: TimeSlot, startSlot: TimeSlot, endSlot: TimeSlot): boolean => {
  return (
    (isAfter(slot.start, startSlot.start) || isEqual(slot.start, startSlot.start)) &&
    (isBefore(slot.end, endSlot.end) || isEqual(slot.end, endSlot.end))
  );
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

export const formatTime = (time: Date, formatStr: string = 'HH:mm'): string => {
  return format(time, formatStr);
};

export const formatTimeSlot = (slot: TimeSlot, formatStr: string): string => {
  const formattedStart = format(slot.start, formatStr);
  const formattedEnd = format(slot.end, formatStr);
  return `${formattedStart} - ${formattedEnd}`;
};
