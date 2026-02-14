import {
  addDays,
  addMinutes,
  differenceInMinutes,
  formatDuration,
  intervalToDuration,
  isSameDay,
  setMinutes,
  startOfDay,
} from 'date-fns';

type FormatType = 'short' | 'medium' | 'long';
type FormatOption = { format: FormatType; locale: string; timezone?: string };

const DATETIME_FORMATS: Record<FormatType, Intl.DateTimeFormatOptions> = {
  // 10/1/2023, 10:00
  short: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false },
  // 1 Oct 2023, 10:00 AM
  medium: { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' },
  // Monday, 1 October 2023 at 10:00 AM GMT+2
  long: {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  },
};

const DATE_FORMATS: Record<FormatType, Intl.DateTimeFormatOptions> = {
  // 10/01/2023
  short: { day: '2-digit', month: '2-digit', year: 'numeric' },
  // 1 Oct 2023
  medium: { day: 'numeric', month: 'short', year: 'numeric' },
  // 1 October 2023
  long: { day: 'numeric', month: 'long', year: 'numeric' },
};

const DAY_FORMATS: Record<FormatType, Intl.DateTimeFormatOptions> = {
  // 01
  short: { day: '2-digit' },
  // 1 Oct
  medium: { day: 'numeric', month: 'short' },
  // 1 October
  long: { day: 'numeric', month: 'long' },
};

const TIME_FORMATS: Record<FormatType, Intl.DateTimeFormatOptions> = {
  // 10:00
  short: { hour: '2-digit', minute: '2-digit', hour12: false },
  // 10:00 AM
  medium: { hour: 'numeric', minute: 'numeric' },
  // 10:00 AM GMT+2
  long: { hour: 'numeric', minute: 'numeric', timeZoneName: 'short' },
};

export function formatDatetime(date: Date, options: FormatOption): string {
  const { format, locale, timezone } = options;
  const intlFormat = { ...DATETIME_FORMATS[format], timeZone: timezone };
  return new Intl.DateTimeFormat(locale, intlFormat).format(date);
}

export function formatDate(date: Date, options: FormatOption): string {
  const { format, locale, timezone } = options;
  const intlFormat = { ...DATE_FORMATS[format], timeZone: timezone };
  return new Intl.DateTimeFormat(locale, intlFormat).format(date);
}

export function formatDay(date: Date, options: FormatOption): string {
  const { format, locale, timezone } = options;
  const intlFormat = { ...DAY_FORMATS[format], timeZone: timezone };
  return new Intl.DateTimeFormat(locale, intlFormat).format(date);
}

export function formatDateRange(startDate: Date, endDate: Date, options: FormatOption): string {
  const { format, locale, timezone } = options;

  if (!startDate) return '';

  if (isSameDay(startDate, endDate)) {
    return formatDate(startDate, { format: 'long', locale, timezone });
  }

  const startDay = formatDay(startDate, { format, locale, timezone });
  const endDay = formatDate(endDate, { format, locale, timezone });
  return `${startDay} / ${endDay}`;
}

export function formatTime(time: Date | number, options: FormatOption): string {
  if (typeof time === 'number') {
    time = setMinutes(startOfDay(new Date()), time);
  }
  const { format, locale, timezone } = options;
  const intlFormat = { ...TIME_FORMATS[format], timeZone: timezone };
  return new Intl.DateTimeFormat(locale, intlFormat).format(time);
}

export function toDateInput(date?: Date | null) {
  if (!date) return null;
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDistance(date: Date, locale: string, direction: 'from' | 'to' = 'from'): string {
  const minutes = Math.abs(differenceInMinutes(Date.now(), date));

  const options: Intl.RelativeTimeFormatOptions = { numeric: 'auto', style: 'long', localeMatcher: 'best fit' };
  const rtf = new Intl.RelativeTimeFormat(locale, options);

  const duration = direction === 'from' ? -minutes : minutes;
  if (minutes < 60) {
    return rtf.format(duration, 'minute');
  } else if (minutes < 1440) {
    return rtf.format(Math.round(duration / 60), 'hour');
  } else if (minutes < 43200) {
    return rtf.format(Math.round(duration / 1440), 'day');
  } else if (minutes < 525600) {
    return rtf.format(Math.round(duration / 43200), 'month');
  }
  return rtf.format(Math.round(duration / 525600), 'year');
}

// todo(i18n) use Intl.DurationFormat instead of date-fns (needs Node 23+)
/**
 * Format the difference between two dates to a string like '2h 10m'
 * Note:
 * - Zero values are omitted (e.g. '2h' instead of '2h 0m')
 * - When date1 > date2, negative values are returned (e.g. '-2h -10m')
 */
export function formatTimeDifference(date1: Date, date2: Date) {
  const duration = intervalToDuration({ start: date1, end: date2 });
  return formatDuration(duration, {
    format: ['hours', 'minutes'],
    zero: false, // Don't include zero values
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
