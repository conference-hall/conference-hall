import { addMinutes, differenceInMinutes, format, startOfDay } from 'date-fns';

// Returns total of minutes from the start of a day
export function getMinutesFromStartOfDay(date: Date): number {
  return differenceInMinutes(date, startOfDay(date));
}

// Add minutes to the start of a day
export function setMinutesFromStartOfDay(date: Date, minutes: number): Date {
  return addMinutes(startOfDay(date), minutes);
}

// Format a date to a time HH:mm
export const toTimeFormat = (time: Date): string => {
  return format(time, 'HH:mm');
};
