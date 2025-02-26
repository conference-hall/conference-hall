import { db } from 'prisma/db.server.ts';

import type { EventIntegrationName } from '@prisma/client';
import { OpenPlanner } from '~/libs/integrations/open-planner.ts';
import type { EventIntegrationConfigData } from './event-integrations.types.ts';
import { UserEvent } from './user-event.ts';

export class EventIntegrations {
  private userEvent: UserEvent;

  constructor(userId: string, teamSlug: string, eventSlug: string) {
    this.userEvent = new UserEvent(userId, teamSlug, eventSlug);
  }

  static for(userId: string, teamSlug: string, eventSlug: string) {
    return new EventIntegrations(userId, teamSlug, eventSlug);
  }

  async getConfiguration(name: EventIntegrationName) {
    const event = await this.userEvent.needsPermission('canEditEvent');
    const integration = await db.eventIntegrationConfig.findFirst({ where: { eventId: event.id, name } });

    if (!integration) return null;

    return {
      id: integration.id,
      name: integration.name,
      configuration: integration.configuration,
    } as EventIntegrationConfigData;
  }

  async save(data: EventIntegrationConfigData) {
    const event = await this.userEvent.needsPermission('canEditEvent');

    if (!data.id) {
      await db.eventIntegrationConfig.create({ data: { ...data, eventId: event.id } });
    } else {
      await db.eventIntegrationConfig.update({ where: { id: data.id }, data });
    }
  }

  async checkConfiguration(data: EventIntegrationConfigData) {
    if (data.name === 'OPEN_PLANNER') {
      const { eventId, apiKey } = data.configuration;
      return OpenPlanner.checkConfiguration(eventId, apiKey);
    }
  }

  async delete(id: string) {
    const event = await this.userEvent.needsPermission('canEditEvent');
    await db.eventIntegrationConfig.delete({ where: { id, eventId: event.id } });
  }
}
