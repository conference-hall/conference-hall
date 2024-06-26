import { format as formatter, formatDistanceToNow, isSameDay } from 'date-fns';

import type { CfpState, EventType } from '~/types/events.types';

export function formatEventType(type: EventType) {
  switch (type) {
    case 'CONFERENCE':
      return 'Conference';
    case 'MEETUP':
      return 'Meetup';
  }
}

export function formatConferenceDates(type: EventType, start?: string, end?: string) {
  if (!start || !end) return formatEventType(type);
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isSameDay(startDate, endDate)) {
    return formatter(startDate, 'PPP');
  }

  const startFormatted = formatter(startDate, 'MMMM do');
  const endFormatted = formatter(endDate, 'PPP');
  return `${startFormatted} to ${endFormatted}`;
}

export function formatCFPState(state: CfpState, start?: string | null, end?: string | null) {
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

export function formatCFPElapsedTime(state: CfpState, start?: string | null, end?: string | null) {
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

// TODO: add format arg tests
export function formatCFPDate(state: CfpState, start?: string, end?: string, format = 'PPPPp') {
  if (!start || !end) return undefined;

  switch (state) {
    case 'CLOSED':
      return `Open on ${formatter(new Date(start), format)}`;
    case 'OPENED':
      return `Open until ${formatter(new Date(end), format)}`;
    case 'FINISHED':
      return `Closed since ${formatter(new Date(end), format)}`;
  }
}

const STATUSES = { OPENED: 'success', CLOSED: 'warning', FINISHED: 'error' } as const;

// TODO: add tests
export function cfpColorStatus(cfpState: CfpState, cfpStart?: string, cfpEnd?: string) {
  if (!cfpStart && !cfpEnd) return 'disabled';
  return STATUSES[cfpState];
}
