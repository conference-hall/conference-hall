import { db } from 'prisma/db.server.ts';

import type { EventIntegrationName } from '@prisma/client';
import type { EventIntegrationConfigData } from './event-integrations.types.ts';
import { UserEvent } from './user-event.ts';

export class EventIntegrations extends UserEvent {
  static for(userId: string, teamSlug: string, eventSlug: string) {
    return new EventIntegrations(userId, teamSlug, eventSlug);
  }

  async getConfiguration(name: EventIntegrationName) {
    const event = await this.needsPermission('canEditEvent');
    const integration = await db.eventIntegrationConfig.findFirst({ where: { eventId: event.id, name } });

    if (!integration) return null;

    return {
      id: integration.id,
      name: integration.name,
      configuration: integration.configuration,
    } as EventIntegrationConfigData;
  }

  async save(data: EventIntegrationConfigData) {
    const event = await this.needsPermission('canEditEvent');

    if (!data.id) {
      await db.eventIntegrationConfig.create({ data: { ...data, eventId: event.id } });
    } else {
      await db.eventIntegrationConfig.update({ where: { id: data.id }, data });
    }
  }

  async delete(id: string) {
    const event = await this.needsPermission('canEditEvent');
    await db.eventIntegrationConfig.delete({ where: { id, eventId: event.id } });
  }
}
