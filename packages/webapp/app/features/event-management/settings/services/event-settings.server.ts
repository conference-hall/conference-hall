import type { Prisma } from '@conference-hall/database';
import { db } from '@conference-hall/database';
import { EventAuthorization } from '~/shared/user/event-authorization.server.ts';
import { EventGeneralSettingsSchema } from './event-settings.schema.server.ts';

export class EventSettings extends EventAuthorization {
  static for(userId: string, teamSlug: string, eventSlug: string) {
    return new EventSettings(userId, teamSlug, eventSlug);
  }

  async update(data: Partial<Prisma.EventCreateInput>) {
    const { event } = await this.checkAuthorizedEvent('canEditEvent');
    return db.event.update({ where: { id: event.id }, data: { ...data } });
  }

  async delete() {
    const { event } = await this.checkAuthorizedEvent('canDeleteEvent');
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
