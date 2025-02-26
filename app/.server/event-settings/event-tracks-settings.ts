import { db } from 'prisma/db.server.ts';

import type { TrackSaveData, TrackSettingsSaveData } from './event-tracks-settings.types.ts';
import { UserEvent } from './user-event.ts';

export class EventTracksSettings {
  private userEvent: UserEvent;

  constructor(userId: string, teamSlug: string, eventSlug: string) {
    this.userEvent = new UserEvent(userId, teamSlug, eventSlug);
  }

  static for(userId: string, teamSlug: string, eventSlug: string) {
    return new EventTracksSettings(userId, teamSlug, eventSlug);
  }

  async updateSettings(data: TrackSettingsSaveData) {
    this.userEvent.update(data);
  }

  async saveFormat(data: TrackSaveData) {
    const event = await this.userEvent.needsPermission('canEditEvent');

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
    await this.userEvent.needsPermission('canEditEvent');
    return db.eventFormat.delete({ where: { id: formatId } });
  }

  async saveCategory(data: TrackSaveData) {
    const event = await this.userEvent.needsPermission('canEditEvent');

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
    await this.userEvent.needsPermission('canEditEvent');
    return db.eventCategory.delete({ where: { id: categoryId } });
  }
}
