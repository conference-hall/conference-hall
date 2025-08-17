import { db } from 'prisma/db.server.ts';
import type { EventCreateInput } from 'prisma/generated/models.ts';
import { UserEventAuthorization } from '~/shared/user/user-event-authorization.server.ts';
import { EventGeneralSettingsSchema } from './event-settings.schema.server.ts';

export class EventSettings extends UserEventAuthorization {
  static for(userId: string, teamSlug: string, eventSlug: string) {
    return new EventSettings(userId, teamSlug, eventSlug);
  }

  async update(data: Partial<EventCreateInput>) {
    const event = await this.needsPermission('canEditEvent');
    return db.event.update({ where: { id: event.id }, data: { ...data } });
  }

  async delete() {
    const event = await this.needsPermission('canDeleteEvent');
    return db.event.delete({ where: { id: event.id } });
  }

  async buildGeneralSettingsSchema() {
    return EventGeneralSettingsSchema.refine(
      async ({ slug }) => {
        const count = await db.event.count({ where: { AND: [{ slug }, { slug: { not: this.event } }] } });
        return count === 0;
      },
      { path: ['slug'], error: 'This URL already exists.' },
    );
  }
}
