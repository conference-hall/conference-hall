import { randUuid } from '@ngneat/falso';
import { db, type Event, type Prisma } from '../../index.ts';

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
