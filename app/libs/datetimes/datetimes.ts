import { addMinutes, differenceInMinutes, format, startOfDay } from 'date-fns';

// TODOXXX: tests
export function getMinutesFromStartOfDay(date: Date): number {
  return differenceInMinutes(date, startOfDay(date));
}

// TODOXXX: tests
export function setMinutesFromStartOfDay(date: Date, minutes: number): Date {
  return addMinutes(startOfDay(date), minutes);
}

// TODOXXX: tests
export const toTimeFormat = (time: Date, formatStr: string = 'HH:mm'): string => {
  return format(time, formatStr);
};
