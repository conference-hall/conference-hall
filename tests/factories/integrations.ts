import { randUuid } from '@ngneat/falso';
import { db } from '../../prisma/db.server.ts';
import type { Event } from '../../prisma/generated/client.ts';
import type { EventIntegrationConfigCreateInput } from '../../prisma/generated/models.ts';

type FactoryOptions = {
  event: Event;
  attributes?: Partial<EventIntegrationConfigCreateInput>;
};

export const eventIntegrationFactory = (options: FactoryOptions) => {
  const { attributes = {}, event } = options;

  const defaultAttributes: EventIntegrationConfigCreateInput = {
    name: 'OPEN_PLANNER',
    configuration: { eventId: randUuid(), apiKey: randUuid() },
    event: { connect: { id: event.id } },
  };

  const data = { ...defaultAttributes, ...attributes };

  return db.eventIntegrationConfig.create({ data });
};
