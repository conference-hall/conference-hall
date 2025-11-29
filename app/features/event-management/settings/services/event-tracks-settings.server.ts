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

    const formatsCount = await db.eventFormat.count({ where: { eventId: event.id } });
    const newFormat = await db.eventFormat.create({
      data: {
        name: data.name,
        description: data.description,
        order: formatsCount,
        event: { connect: { id: event.id } },
      },
    });
    await this.orderAllFormats(event.id, newFormat.id, formatsCount);
  }

  async deleteFormat(formatId: string) {
    const { event } = await this.checkAuthorizedEvent('canEditEvent');

    await db.eventFormat.delete({ where: { id: formatId } });

    const remainingFormats = await db.eventFormat.findMany({
      where: { eventId: event.id },
      orderBy: { order: 'asc' },
      select: { id: true },
    });

    if (remainingFormats.length > 0) {
      await this.orderAllFormats(event.id, remainingFormats[0].id, 0);
    }
  }

  async saveCategory(data: TrackSaveData) {
    const { event } = await this.checkAuthorizedEvent('canEditEvent');

    if (data.id) {
      return db.eventCategory.update({
        where: { id: data.id },
        data: { name: data.name, description: data.description },
      });
    }

    const categoriesCount = await db.eventCategory.count({ where: { eventId: event.id } });
    const newCategory = await db.eventCategory.create({
      data: {
        name: data.name,
        description: data.description,
        order: categoriesCount,
        event: { connect: { id: event.id } },
      },
    });
    await this.orderAllCategories(event.id, newCategory.id, categoriesCount);
  }

  async deleteCategory(categoryId: string) {
    const { event } = await this.checkAuthorizedEvent('canEditEvent');

    await db.eventCategory.delete({ where: { id: categoryId } });

    const remainingCategories = await db.eventCategory.findMany({
      where: { eventId: event.id },
      orderBy: { order: 'asc' },
      select: { id: true },
    });

    if (remainingCategories.length > 0) {
      await this.orderAllCategories(event.id, remainingCategories[0].id, 0);
    }
  }

  async reorderFormat(trackId: string, direction: 'up' | 'down') {
    const { event } = await this.checkAuthorizedEvent('canEditEvent');

    const currentTrack = await db.eventFormat.findUnique({ where: { id: trackId } });
    if (!currentTrack) return;

    const targetOrder = direction === 'up' ? currentTrack.order - 1 : currentTrack.order + 1;
    await this.orderAllFormats(event.id, trackId, targetOrder);
  }

  async reorderCategory(trackId: string, direction: 'up' | 'down') {
    const { event } = await this.checkAuthorizedEvent('canEditEvent');

    const currentTrack = await db.eventCategory.findUnique({ where: { id: trackId } });
    if (!currentTrack) return;

    const targetOrder = direction === 'up' ? currentTrack.order - 1 : currentTrack.order + 1;
    await this.orderAllCategories(event.id, trackId, targetOrder);
  }

  private async orderAllFormats(eventId: string, formatId: string, targetOrder: number) {
    const formats = await db.eventFormat.findMany({ where: { eventId }, orderBy: { order: 'asc' } });

    const currentIndex = formats.findIndex((f) => f.id === formatId);
    if (currentIndex === -1) return;

    const [movedFormat] = formats.splice(currentIndex, 1);
    formats.splice(targetOrder, 0, movedFormat);

    await db.$transaction(
      formats.map((format, index) =>
        db.eventFormat.update({
          where: { id: format.id },
          data: { order: index },
        }),
      ),
    );
  }

  private async orderAllCategories(eventId: string, categoryId: string, targetOrder: number) {
    const categories = await db.eventCategory.findMany({ where: { eventId }, orderBy: { order: 'asc' } });

    const currentIndex = categories.findIndex((c) => c.id === categoryId);
    if (currentIndex === -1) return;

    const [movedCategory] = categories.splice(currentIndex, 1);
    categories.splice(targetOrder, 0, movedCategory);

    await db.$transaction(
      categories.map((category, index) =>
        db.eventCategory.update({
          where: { id: category.id },
          data: { order: index },
        }),
      ),
    );
  }
}
