import type { PrismaClient } from '@prisma/client';

import type { CfpState } from '../../app/types/events.types.ts';

export function applyEventExtension(prisma: PrismaClient) {
  return prisma
    .$extends({
      result: {
        event: {
          cfpState: {
            needs: { type: true, cfpStart: true, cfpEnd: true },
            compute({ type, cfpStart, cfpEnd }): CfpState {
              if (type === 'MEETUP' && isMeetupOpened(cfpStart)) return 'OPENED';
              if (type === 'CONFERENCE' && isConferenceOpened(cfpStart, cfpEnd)) return 'OPENED';
              if (type === 'CONFERENCE' && isConferenceFinished(cfpEnd)) return 'FINISHED';
              return 'CLOSED';
            },
          },
        },
      },
    })
    .$extends({
      result: {
        event: {
          isCfpOpen: {
            needs: { cfpState: true },
            compute({ cfpState }) {
              return cfpState === 'OPENED';
            },
          },
        },
      },
    });
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
