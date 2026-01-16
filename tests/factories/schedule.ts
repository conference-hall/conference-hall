import type { Event } from 'prisma/generated/client.ts';
import type { ScheduleCreateInput } from 'prisma/generated/models.ts';
import { randText } from '@ngneat/falso';
import { db } from '../../prisma/db.server.ts';
import { eventFactory } from './events.ts';

type FactoryOptions = {
  attributes?: Partial<ScheduleCreateInput>;
  event?: Event;
};

export const scheduleFactory = async (options: FactoryOptions = {}) => {
  const { attributes = {} } = options;

  if (!options.event) {
    options.event = await eventFactory({ traits: ['conference'] });
  }

  const defaultAttributes: ScheduleCreateInput = {
    name: randText(),
    event: { connect: { id: options.event?.id } },
    timezone: 'Europe/Paris',
    start: '2024-10-05T00:00:00.000Z',
    end: '2024-10-06T00:00:00.000Z',
    displayStartMinutes: 9 * 60,
    displayEndMinutes: 18 * 60,
  };

  const data = { ...defaultAttributes, ...attributes };

  return db.schedule.create({ data });
};
