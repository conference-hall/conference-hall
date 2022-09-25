import format from 'date-fns/format';
import isSameDay from 'date-fns/isSameDay';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

export type CfpState = 'CLOSED' | 'OPENED' | 'FINISHED';

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

export function formatEventType(type: 'CONFERENCE' | 'MEETUP') {
  switch (type) {
    case 'CONFERENCE':
      return 'Conference';
    case 'MEETUP':
      return 'Meetup';
  }
}

export function formatConferenceDates(type: 'CONFERENCE' | 'MEETUP', start?: string, end?: string) {
  if (!start || !end) return formatEventType(type);
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isSameDay(startDate, endDate)) {
    return `1 day conference - ${format(startDate, 'PPP')}`;
  }

  const numberOfDays = differenceInCalendarDays(endDate, startDate) + 1;
  const startFormatted = format(startDate, 'MMMM do');
  const endFormatted = format(endDate, 'PPP');
  return `${numberOfDays} days conference · ${startFormatted} — ${endFormatted}`;
}

export function formatCFPState(state: CfpState) {
  switch (state) {
    case 'CLOSED':
      return 'Call for paper is not open yet';
    case 'OPENED':
      return 'Call for paper is open';
    case 'FINISHED':
      return 'Call for paper is closed';
  }
}

export function formatCFPElapsedTime(state: CfpState, start?: string | null, end?: string | null) {
  if (!start || !end) return formatCFPState(state);
  const startDate = new Date(start);
  const endDate = new Date(end);

  switch (state) {
    case 'CLOSED':
      return `Call for paper will be open in ${formatDistanceToNow(startDate)}`;
    case 'OPENED':
      return `Call for paper is open for ${formatDistanceToNow(endDate)}`;
    case 'FINISHED':
      return `Call for paper closed since ${formatDistanceToNow(endDate)}`;
  }
}

export function formatCFPDate(state: CfpState, start?: string, end?: string) {
  if (!start || !end) return;
  switch (state) {
    case 'CLOSED':
      return `Will open ${format(new Date(start), 'PPPPp O')}`;
    case 'OPENED':
      return `Until ${format(new Date(end), 'PPPPp O')}`;
    case 'FINISHED':
      return `Since ${format(new Date(end), 'PPPP')}`;
  }
}
