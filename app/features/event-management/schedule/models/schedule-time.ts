import { formatDate, formatDateRange, formatTime, getDatesRange } from '~/shared/datetimes/datetimes.ts';
import { getGMTOffset, timezoneToUtc, utcToTimezone } from '~/shared/datetimes/timezone.ts';
import type { ScheduleSession, SessionData } from '../components/schedule.types.ts';

// Owns the Schedule time of a Schedule: the only passage between UTC and the wall-clock time of the Schedule
// timezone, and the only formatter bound to that timezone.
export class ScheduleTime {
  constructor(private timezone: string) {}

  fromUtc(date: Date): Date {
    return utcToTimezone(date, this.timezone);
  }

  toUtc(date: Date): Date {
    return timezoneToUtc(date, this.timezone);
  }

  session({ start, end, ...session }: SessionData): ScheduleSession {
    return { ...session, timeslot: { start: this.fromUtc(start), end: this.fromUtc(end) } };
  }

  // The days of the Schedule, each at midnight in the Schedule timezone.
  days(start: Date, end: Date): Array<Date> {
    return getDatesRange(this.fromUtc(start), this.fromUtc(end));
  }

  // The index of the Schedule day matching a calendar date received as midnight UTC (what a date input emits),
  // or null when the date is outside of the Schedule. Compared by calendar key, never through the browser timezone.
  dayIndex(days: Array<Date>, calendarDate: Date): number | null {
    const key = calendarKey(calendarDate.getUTCFullYear(), calendarDate.getUTCMonth(), calendarDate.getUTCDate());
    const index = days.findIndex((day) => {
      const scheduleDay = this.fromUtc(day);
      return calendarKey(scheduleDay.getFullYear(), scheduleDay.getMonth(), scheduleDay.getDate()) === key;
    });
    return index === -1 ? null : index;
  }

  formatTime(date: Date, locale: string): string {
    return formatTime(date, { format: 'short', locale, timezone: this.timezone });
  }

  formatDate(date: Date, locale: string): string {
    return formatDate(date, { format: 'long', locale, timezone: this.timezone });
  }

  formatDateRange(start: Date, end: Date, locale: string): string {
    return formatDateRange(this.fromUtc(start), this.fromUtc(end), {
      format: 'medium',
      locale,
      timezone: this.timezone,
    });
  }

  gmtOffset(locale: string): string | null {
    return getGMTOffset(this.timezone, locale);
  }
}

function calendarKey(year: number, month: number, day: number): string {
  return `${year}-${month}-${day}`;
}
