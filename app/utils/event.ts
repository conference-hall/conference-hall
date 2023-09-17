import format from 'date-fns/format/index.js';
import formatDistanceToNow from 'date-fns/formatDistanceToNow/index.js';
import isSameDay from 'date-fns/isSameDay/index.js';

import type { CfpState, EventType } from '~/routes/__types/event.ts';

function isConferenceOpened(start?: Date | null, end?: Date | null) {
  if (!start || !end) return false;
  const today = new Date();
  return today >= start && today <= end;
}

function isConferenceFinished(end?: Date | null) {
  if (!end) return false;
  const today = new Date();
  return today > end;
}

function isMeetupOpened(start?: Date | null) {
  if (!start) return false;
  const today = new Date();
  return today >= start;
}

export function getCfpState(type: string, start?: Date | null, end?: Date | null): CfpState {
  if (type === 'MEETUP') {
    if (isMeetupOpened(start)) return 'OPENED';
  }
  if (type === 'CONFERENCE') {
    if (isConferenceOpened(start, end)) return 'OPENED';
    if (isConferenceFinished(end)) return 'FINISHED';
  }
  return 'CLOSED';
}

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
    return format(startDate, 'PPP');
  }

  const startFormatted = format(startDate, 'MMMM do');
  const endFormatted = format(endDate, 'PPP');
  return `${startFormatted} to ${endFormatted}`;
}

export function formatCFPState(state: CfpState) {
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
  if (!start || !end) return formatCFPState(state);
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

export function formatCFPDate(state: CfpState, start?: string, end?: string) {
  if (!start || !end) return;
  switch (state) {
    case 'CLOSED':
      return `Open on ${format(new Date(start), 'PPPPp')}`;
    case 'OPENED':
      return `Open until ${format(new Date(end), 'PPPPp')}`;
    case 'FINISHED':
      return `Closed since ${format(new Date(end), 'PPPP')}`;
  }
}
