import { addMinutes, differenceInMinutes, startOfDay } from 'date-fns';

// TODOXXX: tests
export function getMinutesFromStartOfDay(date: Date): number {
  return differenceInMinutes(date, startOfDay(date));
}

// TODOXXX: tests
export function setMinutesFromStartOfDay(date: Date, minutes: number): Date {
  return addMinutes(startOfDay(date), minutes);
}
