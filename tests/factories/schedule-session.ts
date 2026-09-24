import { db } from '../../prisma/db.server.ts';
import type { Proposal, Schedule, ScheduleTrack } from '../../prisma/generated/client.ts';

type FactoryOptions = {
  schedule: Schedule;
  track: ScheduleTrack;
  start: Date;
  end: Date;
  name?: string;
  color?: string;
  proposal?: Proposal;
};

export const scheduleSessionFactory = async (options: FactoryOptions) => {
  const { schedule, track, start, end, name, color, proposal } = options;

  return db.scheduleSession.create({
    data: {
      scheduleId: schedule.id,
      trackId: track.id,
      start,
      end,
      name: name ?? null,
      color: color ?? null,
      proposalId: proposal?.id ?? null,
    },
  });
};
