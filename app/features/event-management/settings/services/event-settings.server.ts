import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import type { EventCreateInput } from '../../../../../prisma/generated/models.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { EventGeneralSettingsSchema } from './event-settings.schema.server.ts';

export class EventSettings {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new EventSettings(authorizedEvent);
  }

  async update(data: Partial<EventCreateInput>) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();
    return db.event.update({ where: { id: event.id }, data: { ...data } });
  }

  async delete() {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canDeleteEvent) throw new ForbiddenOperationError();
    return db.event.delete({ where: { id: event.id } });
  }

  async buildGeneralSettingsSchema() {
    const { event } = this.authorizedEvent;
    return EventGeneralSettingsSchema.refine(
      async ({ slug }) => {
        const count = await db.event.count({ where: { AND: [{ slug }, { id: { not: event.id } }] } });
        return count === 0;
      },
      { path: ['slug'], error: 'This URL already exists.' },
    );
  }
}
