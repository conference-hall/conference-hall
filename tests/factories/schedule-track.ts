import { db } from '../../prisma/db.server.ts';
import type { Schedule } from '../../prisma/generated/client.ts';

type FactoryOptions = {
  name: string;
  schedule: Schedule;
};

export const scheduleTrackFactory = async ({ name, schedule }: FactoryOptions) => {
  return db.scheduleTrack.create({ data: { name, scheduleId: schedule.id } });
};
