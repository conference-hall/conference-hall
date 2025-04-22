import { formatDistanceToNow, isSameDay } from 'date-fns';
import type { CfpState } from '~/types/events.types.ts';
import { formatInTimeZone, utcToTimezone } from '../datetimes/timezone.ts';

// todo(i18n): manage cfp translations

export function formatConferenceDates(timezone: string, start: Date, end: Date) {
  const startDate = utcToTimezone(start, timezone);
  const endDate = utcToTimezone(end, timezone);

  if (isSameDay(startDate, endDate)) {
    return formatInTimeZone(startDate, 'PPP (z)', timezone);
  }

  const startFormatted = formatInTimeZone(startDate, 'MMMM do', timezone);
  const endFormatted = formatInTimeZone(endDate, 'PPP (z)', timezone);
  return `${startFormatted} to ${endFormatted}`;
}

export function formatCFPState(state: CfpState, start: Date | null, end: Date | null) {
  if (!start && !end) return 'Call for paper is disabled';

  switch (state) {
    case 'CLOSED':
      return 'Opening soon';
    case 'OPENED':
      return 'Call for paper open';
    case 'FINISHED':
      return 'Call for paper closed';
  }
}

export function formatCFPElapsedTime(state: CfpState, start: Date | null, end: Date | null) {
  if (!start && !end) return 'Call for paper is disabled';
  if (!start || !end) return formatCFPState(state, start, end);

  const startDate = new Date(start);
  const endDate = new Date(end);

  switch (state) {
    case 'CLOSED':
      return `Call for paper open in ${formatDistanceToNow(startDate)}`;
    case 'OPENED':
      return `Call for paper open for ${formatDistanceToNow(endDate)}`;
    case 'FINISHED':
      return `Call for paper closed since ${formatDistanceToNow(endDate)}`;
  }
}

export function formatCFPDate(
  state: CfpState,
  timezone: string,
  start: Date | null,
  end: Date | null,
  format = 'PPPPp (z)',
) {
  if (!start || !end) return undefined;
  const startDate = utcToTimezone(start, timezone);
  const endDate = utcToTimezone(end, timezone);

  switch (state) {
    case 'CLOSED':
      return `Open on ${formatInTimeZone(startDate, format, timezone)}`;
    case 'OPENED':
      return `Open until ${formatInTimeZone(endDate, format, timezone)}`;
    case 'FINISHED':
      return `Closed since ${formatInTimeZone(endDate, format, timezone)}`;
  }
}

const STATUSES = { OPENED: 'success', CLOSED: 'warning', FINISHED: 'error' } as const;

export function cfpColorStatus(cfpState: CfpState, cfpStart: Date | null, cfpEnd: Date | null) {
  if (!cfpStart && !cfpEnd) return 'disabled';
  return STATUSES[cfpState];
}
