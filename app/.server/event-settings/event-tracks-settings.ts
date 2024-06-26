import { db } from 'prisma/db.server.ts';

import type { TrackSaveData, TrackSettingsSaveData } from './event-tracks-settings.types.ts';
import { UserEvent } from './user-event.ts';

export class EventTracksSettings extends UserEvent {
  static for(userId: string, teamSlug: string, eventSlug: string) {
    return new EventTracksSettings(userId, teamSlug, eventSlug);
  }

  async updateSettings(data: TrackSettingsSaveData) {
    super.update(data);
  }

  async saveFormat(data: TrackSaveData) {
    await this.allowedFor(['OWNER']);

    if (data.id) {
      return db.eventFormat.update({
        where: { id: data.id },
        data: { name: data.name, description: data.description },
      });
    }
    return db.eventFormat.create({
      data: { name: data.name, description: data.description, event: { connect: { slug: this.eventSlug } } },
    });
  }

  async deleteFormat(formatId: string) {
    await this.allowedFor(['OWNER']);
    return db.eventFormat.delete({ where: { id: formatId } });
  }

  async saveCategory(data: TrackSaveData) {
    await this.allowedFor(['OWNER']);
    if (data.id) {
      return db.eventCategory.update({
        where: { id: data.id },
        data: { name: data.name, description: data.description },
      });
    }
    return db.eventCategory.create({
      data: { name: data.name, description: data.description, event: { connect: { slug: this.eventSlug } } },
    });
  }

  async deleteCategory(categoryId: string) {
    await this.allowedFor(['OWNER']);
    return db.eventCategory.delete({ where: { id: categoryId } });
  }
}