import type { EventIntegrationName } from 'prisma/generated/client.ts';
import { db } from 'prisma/db.server.ts';
import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { OpenPlanner } from '~/shared/integrations/open-planner.server.ts';
import { type IntegrationConfigData, IntegrationConfigSchema } from './event-integrations.schema.server.ts';

export class EventIntegrations {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new EventIntegrations(authorizedEvent);
  }

  static async getConfiguration(eventId: string, name: EventIntegrationName) {
    const integration = await db.eventIntegrationConfig.findFirst({ where: { eventId, name } });

    if (!integration) return null;

    return IntegrationConfigSchema.parse({
      id: integration.id,
      name: integration.name,
      configuration: integration.configuration,
    });
  }

  async getConfigurations() {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();
    const integrations = await db.eventIntegrationConfig.findMany({ where: { eventId: event.id } });

    return integrations.map((integration) => ({
      id: integration.id,
      name: integration.name,
      configuration: integration.configuration,
    })) as IntegrationConfigData[];
  }

  async save(data: IntegrationConfigData) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();

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
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();
    await db.eventIntegrationConfig.delete({ where: { id, eventId: event.id } });
  }
}
