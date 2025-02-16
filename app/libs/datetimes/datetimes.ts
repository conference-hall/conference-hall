import { addMinutes, differenceInMinutes, format, formatDuration, intervalToDuration, startOfDay } from 'date-fns';

// Returns total of minutes from the start of a day
export function getMinutesFromStartOfDay(date: Date): number {
  return differenceInMinutes(date, startOfDay(date));
}

// Add minutes to the start of a day
export function setMinutesFromStartOfDay(date: Date, minutes: number): Date {
  return addMinutes(startOfDay(date), minutes);
}

// Format a date to a time HH:mm
export function toTimeFormat(time: Date): string {
  return format(time, 'HH:mm');
}

// TODO: add tests
export function formatTimeDifference(date1: Date, date2: Date) {
  const duration = intervalToDuration({ start: date1, end: date2 });
  return formatDuration(duration, {
    format: ['hours', 'minutes'],
    zero: true,
    delimiter: ' ',
    locale: {
      formatDistance: (token, count) => {
        switch (token) {
          case 'xHours':
            return `${count}h`;
          case 'xMinutes':
            return `${count}m`;
          default:
            return '';
        }
      },
    },
  });
}
