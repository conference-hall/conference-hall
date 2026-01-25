import type { CfpState } from '../../app/shared/types/events.types.ts';
import { Prisma } from '../../prisma/generated/client.ts';

export const eventExtension = Prisma.defineExtension({
  result: {
    event: {
      cfpState: {
        needs: { type: true, cfpStart: true, cfpEnd: true },
        compute({ type, cfpStart, cfpEnd }) {
          return getCfpState(type, cfpStart, cfpEnd);
        },
      },
      isCfpOpen: {
        needs: { type: true, cfpStart: true, cfpEnd: true },
        compute({ type, cfpStart, cfpEnd }) {
          return getCfpState(type, cfpStart, cfpEnd) === 'OPENED';
        },
      },
    },
  },
});

function getCfpState(type: string, cfpStart: Date | null, cfpEnd: Date | null): CfpState {
  if (type === 'MEETUP' && isMeetupOpened(cfpStart)) return 'OPENED';
  if (type === 'CONFERENCE' && isConferenceOpened(cfpStart, cfpEnd)) return 'OPENED';
  if (type === 'CONFERENCE' && isConferenceFinished(cfpEnd)) return 'FINISHED';
  return 'CLOSED';
}

function isConferenceOpened(start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  const today = new Date();
  return today >= start && today <= end;
}

function isConferenceFinished(end: Date | null) {
  if (!end) return false;
  const today = new Date();
  return today > end;
}

function isMeetupOpened(start: Date | null) {
  if (!start) return false;
  const today = new Date();
  return today >= start;
}
