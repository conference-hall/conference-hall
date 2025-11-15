import type { Schedule } from '../../index.ts';
import { db } from '../../index.ts';

type FactoryOptions = {
  name: string;
  schedule: Schedule;
};

export const scheduleTrackFactory = async ({ name, schedule }: FactoryOptions) => {
  return db.scheduleTrack.create({ data: { name, scheduleId: schedule.id } });
};
