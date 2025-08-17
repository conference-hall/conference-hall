import { db } from 'prisma/db.server.ts';
import type { EventIntegrationName } from 'prisma/generated/enums.ts';
import { OpenPlanner } from '~/shared/integrations/open-planner.server.ts';
import { UserEventAuthorization } from '~/shared/user/user-event-authorization.server.ts';
import { type IntegrationConfigData, IntegrationConfigSchema } from './event-integrations.schema.server.ts';

export class EventIntegrations extends UserEventAuthorization {
  static for(userId: string, teamSlug: string, eventSlug: string) {
    return new EventIntegrations(userId, teamSlug, eventSlug);
  }

  async getConfiguration(name: EventIntegrationName) {
    const event = await this.needsPermission('canAccessEvent');
    const integration = await db.eventIntegrationConfig.findFirst({ where: { eventId: event.id, name } });

    if (!integration) return null;

    return IntegrationConfigSchema.parse({
      id: integration.id,
      name: integration.name,
      configuration: integration.configuration,
    });
  }

  async getConfigurations() {
    const event = await this.needsPermission('canEditEvent');
    const integrations = await db.eventIntegrationConfig.findMany({ where: { eventId: event.id } });

    return integrations.map((integration) => ({
      id: integration.id,
      name: integration.name,
      configuration: integration.configuration,
    })) as IntegrationConfigData[];
  }

  async save(data: IntegrationConfigData) {
    const event = await this.needsPermission('canEditEvent');

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
    const event = await this.needsPermission('canEditEvent');
    await db.eventIntegrationConfig.delete({ where: { id, eventId: event.id } });
  }
}
