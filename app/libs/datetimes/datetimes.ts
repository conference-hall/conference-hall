import {
  addDays,
  addMinutes,
  differenceInMinutes,
  formatDuration,
  intervalToDuration,
  intlFormatDistance,
  setMinutes,
  startOfDay,
} from 'date-fns';

// todo(i18n): use locale in date formatting
// todo: merge formatDate, formatTime, formatDatetime into one function ?

// todo(tests)
export function toISODate(date?: Date | null) {
  if (!date) return undefined;
  return date.toISOString().split('T')[0];
}

type FormatType = 'short' | 'medium' | 'long';
type FormatOption = { format: FormatType; locale: string };

const DATE_FORMATS: Record<FormatType, Intl.DateTimeFormatOptions> = {
  // 10/1/2023
  short: { day: 'numeric', month: 'numeric', year: 'numeric' },
  // 1 Oct 2023
  medium: { day: 'numeric', month: 'short', year: 'numeric' },
  // 1 October 2023
  long: { day: 'numeric', month: 'long', year: 'numeric' },
};

const TIME_FORMATS: Record<FormatType, Intl.DateTimeFormatOptions> = {
  // 10:00
  short: { hour: '2-digit', minute: '2-digit', hour12: false },
  // 10:00 AM
  medium: { hour: 'numeric', minute: 'numeric' },
  // 10:00 AM GMT+2
  long: { hour: 'numeric', minute: 'numeric', timeZoneName: 'short' },
};

const DATETIME_FORMATS: Record<FormatType, Intl.DateTimeFormatOptions> = {
  // 10/1/2023, 10:00
  short: { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false },
  // 1 Oct 2023, 10:00 AM
  medium: { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' },
  // 1 October 2023, 10:00 AM GMT+2
  long: { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short' },
};

// todo(tests)
export function formatDate(date: Date, options: FormatOption): string {
  const { format, locale } = options;
  return new Intl.DateTimeFormat(locale, DATE_FORMATS[format]).format(date);
}

// todo(tests)
// todo: use Intl.RelativeTimeFormat instead of date-fns
export function formatDistanceFromNow(date: Date, locale: string): string {
  const now = new Date();
  return intlFormatDistance(date, now, { locale });
}

// todo(tests)
export function formatTime(time: Date | number, options: FormatOption): string {
  if (typeof time === 'number') {
    time = setMinutes(startOfDay(new Date()), time);
  }
  const { format, locale } = options;
  return new Intl.DateTimeFormat(locale, TIME_FORMATS[format]).format(time);
}

// todo(tests)
export function formatDatetime(date: Date, options: FormatOption): string {
  const { format, locale } = options;
  return new Intl.DateTimeFormat(locale, DATETIME_FORMATS[format]).format(date);
}

// todo: use Intl.DurationFormat instead of date-fns
/** Format the difference between two dates to a string like '2h 10m' */
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

/** Returns total of minutes from the start of a day */
export function getMinutesFromStartOfDay(date: Date): number {
  return differenceInMinutes(date, startOfDay(date));
}

/** Add minutes to the start of a day */
export function setMinutesFromStartOfDay(date: Date, minutes: number): Date {
  return addMinutes(startOfDay(date), minutes);
}

/** Get an array of days between two dates, inclusive */
export function getDatesRange(startDate: Date, endDate: Date) {
  const dates = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  return dates;
}
