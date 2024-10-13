import { randUuid } from '@ngneat/falso';
import type { Event, Prisma } from '@prisma/client';

import { db } from '../../prisma/db.server.ts';

type FactoryOptions = {
  event: Event;
  attributes?: Partial<Prisma.EventIntegrationConfigCreateInput>;
};

export const eventIntegrationFactory = (options: FactoryOptions) => {
  const { attributes = {}, event } = options;

  const defaultAttributes: Prisma.EventIntegrationConfigCreateInput = {
    name: 'OPEN_PLANNER',
    configuration: { eventId: randUuid(), apiKey: randUuid() },
    event: { connect: { id: event.id } },
  };

  const data = { ...defaultAttributes, ...attributes };

  return db.eventIntegrationConfig.create({ data });
};
