import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import isSameDay from 'date-fns/isSameDay'
import format from 'date-fns/format'

type CfpState = 'OPENED' | 'CLOSED' | 'FINISHED'

export function formatEventType(type: 'CONFERENCE' | 'MEETUP') {
  switch (type) {
    case 'CONFERENCE':
      return 'Conference'
    case 'MEETUP':
      return 'Meetup'
  }
}

export function formatConferenceDates(start?: string, end?: string) {
  if (!start || !end) return;
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
      return 'Call for paper is closed';
    case 'OPENED':
      return 'Call for paper is open';
    case 'FINISHED':
      return 'Call for paper is finished';
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