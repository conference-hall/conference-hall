import { DEFAULT_SESSION_COLOR } from '~/features/event-management/schedule/components/session/constants.ts';
import { db } from '../../prisma/db.server.ts';
import type { Proposal, Schedule, ScheduleTrack } from '../../prisma/generated/client.ts';

type FactoryOptions = {
  schedule: Schedule;
  track: ScheduleTrack;
  start: Date;
  end: Date;
  name?: string;
  proposal?: Proposal;
};

export const scheduleSessionFactory = async (options: FactoryOptions) => {
  const { schedule, track, start, end, name, proposal } = options;

  return db.scheduleSession.create({
    data: {
      scheduleId: schedule.id,
      trackId: track.id,
      start,
      end,
      name: name ?? null,
      color: DEFAULT_SESSION_COLOR,
      proposalId: proposal?.id ?? null,
    },
  });
};
