import { formatDistanceToNow, isSameDay } from 'date-fns';
import { format as formatInTimeZone, toZonedTime } from 'date-fns-tz';

import type { CfpState, EventType } from '~/types/events.types';

export function formatEventType(type: EventType) {
  switch (type) {
    case 'CONFERENCE':
      return 'Conference';
    case 'MEETUP':
      return 'Meetup';
  }
}

export function formatConferenceDates(timeZone: string, start: Date, end: Date) {
  const startDate = toZonedTime(start, timeZone);
  const endDate = toZonedTime(end, timeZone);

  if (isSameDay(startDate, endDate)) {
    return formatInTimeZone(startDate, 'PPP (z)', { timeZone });
  }

  const startFormatted = formatInTimeZone(startDate, 'MMMM do', { timeZone });
  const endFormatted = formatInTimeZone(endDate, 'PPP (z)', { timeZone });
  return `${startFormatted} to ${endFormatted}`;
}

export function formatCFPState(state: CfpState, start?: Date | null, end?: Date | null) {
  if (!start && !end) return 'Call for paper is disabled';

  switch (state) {
    case 'CLOSED':
      return 'Call for paper not open yet';
    case 'OPENED':
      return 'Call for paper open';
    case 'FINISHED':
      return 'Call for paper closed';
  }
}

export function formatCFPElapsedTime(state: CfpState, start?: Date | null, end?: Date | null) {
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
  timeZone: string,
  start: Date | null,
  end: Date | null,
  format = 'PPPPp (z)',
) {
  if (!start || !end) return undefined;
  const startDate = toZonedTime(start, timeZone);
  const endDate = toZonedTime(end, timeZone);

  switch (state) {
    case 'CLOSED':
      return `Open on ${formatInTimeZone(startDate, format, { timeZone })}`;
    case 'OPENED':
      return `Open until ${formatInTimeZone(endDate, format, { timeZone })}`;
    case 'FINISHED':
      return `Closed since ${formatInTimeZone(endDate, format, { timeZone })}`;
  }
}

const STATUSES = { OPENED: 'success', CLOSED: 'warning', FINISHED: 'error' } as const;

export function cfpColorStatus(cfpState: CfpState, cfpStart: Date | null, cfpEnd: Date | null) {
  if (!cfpStart && !cfpEnd) return 'disabled';
  return STATUSES[cfpState];
}
