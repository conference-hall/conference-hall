import { randText } from '@ngneat/falso';
import type { Event, Prisma } from '@prisma/client';

import { db } from '../../prisma/db.server.ts';
import { eventFactory } from './events.ts';

type FactoryOptions = {
  attributes?: Partial<Prisma.ScheduleCreateInput>;
  event?: Event;
};

export const scheduleFactory = async (options: FactoryOptions = {}) => {
  const { attributes = {} } = options;

  if (!options.event) {
    options.event = await eventFactory({ traits: ['conference'] });
  }

  const defaultAttributes: Prisma.ScheduleCreateInput = {
    name: randText(),
    event: { connect: { id: options.event?.id } },
  };

  const data = { ...defaultAttributes, ...attributes };

  return db.schedule.create({ data });
};
