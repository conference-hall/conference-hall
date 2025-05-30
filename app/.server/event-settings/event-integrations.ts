import type { EventIntegrationName } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { OpenPlanner } from '~/libs/integrations/open-planner.ts';
import { type IntegrationConfigData, IntegrationConfigSchema } from './event-integrations.types.ts';
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
    const event = await this.userEvent.needsPermission('canAccessEvent');
    const integration = await db.eventIntegrationConfig.findFirst({ where: { eventId: event.id, name } });

    if (!integration) return null;

    return IntegrationConfigSchema.parse({
      id: integration.id,
      name: integration.name,
      configuration: integration.configuration,
    });
  }

  // todo(tests)
  async getConfigurations() {
    const event = await this.userEvent.needsPermission('canEditEvent');
    const integrations = await db.eventIntegrationConfig.findMany({ where: { eventId: event.id } });

    return integrations.map((integration) => ({
      id: integration.id,
      name: integration.name,
      configuration: integration.configuration,
    })) as IntegrationConfigData[];
  }

  async save(data: IntegrationConfigData) {
    const event = await this.userEvent.needsPermission('canEditEvent');

    if (!data.id) {
      await db.eventIntegrationConfig.create({ data: { ...data, eventId: event.id } });
    } else {
      await db.eventIntegrationConfig.update({ where: { id: data.id }, data });
    }
  }

  async checkConfiguration(data: IntegrationConfigData) {
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
