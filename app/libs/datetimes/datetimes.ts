import {
  addDays,
  addMinutes,
  differenceInMinutes,
  format as formatDFNS,
  formatDuration,
  intervalToDuration,
  intlFormatDistance,
  setMinutes,
  startOfDay,
} from 'date-fns';

// todo(i18n): use locale in date formatting

type FormatType = 'short' | 'medium' | 'long';
type FormatOption = { format: FormatType; locale: string };

const DATE_FORMATS: Record<FormatType, Intl.DateTimeFormatOptions> = {
  short: { day: 'numeric', month: 'numeric', year: 'numeric' },
  medium: { day: 'numeric', month: 'short', year: 'numeric' },
  long: { day: 'numeric', month: 'long', year: 'numeric' },
};

// todo(tests)
export function formatDate(date: Date, options: FormatOption): string {
  const { format, locale } = options;
  return new Intl.DateTimeFormat(locale, DATE_FORMATS[format]).format(date);
}

// todo(tests)
export function formatDistanceFromNow(date: Date, locale: string): string {
  const now = new Date();
  return intlFormatDistance(date, now, { locale });
}

// Format a date or number in minutes to a time HH:mm
export function toTimeFormat(time: Date | number): string {
  if (typeof time === 'number') {
    time = setMinutes(startOfDay(new Date()), time);
  }
  return formatDFNS(time, 'HH:mm');
}

// Format the difference between two dates to a string like '2h 10m'
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

// Returns total of minutes from the start of a day
export function getMinutesFromStartOfDay(date: Date): number {
  return differenceInMinutes(date, startOfDay(date));
}

// Add minutes to the start of a day
export function setMinutesFromStartOfDay(date: Date, minutes: number): Date {
  return addMinutes(startOfDay(date), minutes);
}

// Get an array of dates between two dates, inclusive
export function getDatesRange(startDate: Date, endDate: Date) {
  const dates = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  return dates;
}
