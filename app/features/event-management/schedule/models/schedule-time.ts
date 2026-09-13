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
