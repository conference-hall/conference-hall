import { db } from 'prisma/db.server.ts';
import { EventAuthorization } from '~/shared/user/event-authorization.server.ts';
import type { TrackSaveData } from './event-tracks-settings.schema.server.ts';

export class EventTracksSettings extends EventAuthorization {
  static for(userId: string, teamSlug: string, eventSlug: string) {
    return new EventTracksSettings(userId, teamSlug, eventSlug);
  }

  async saveFormat(data: TrackSaveData) {
    const { event } = await this.checkAuthorizedEvent('canEditEvent');

    if (data.id) {
      return db.eventFormat.update({
        where: { id: data.id },
        data: { name: data.name, description: data.description },
      });
    }
    return db.eventFormat.create({
      data: { name: data.name, description: data.description, event: { connect: { id: event.id } } },
    });
  }

  async deleteFormat(formatId: string) {
    await this.checkAuthorizedEvent('canEditEvent');
    return db.eventFormat.delete({ where: { id: formatId } });
  }

  async saveCategory(data: TrackSaveData) {
    const { event } = await this.checkAuthorizedEvent('canEditEvent');

    if (data.id) {
      return db.eventCategory.update({
        where: { id: data.id },
        data: { name: data.name, description: data.description },
      });
    }
    return db.eventCategory.create({
      data: { name: data.name, description: data.description, event: { connect: { id: event.id } } },
    });
  }

  async deleteCategory(categoryId: string) {
    await this.checkAuthorizedEvent('canEditEvent');
    return db.eventCategory.delete({ where: { id: categoryId } });
  }
}
