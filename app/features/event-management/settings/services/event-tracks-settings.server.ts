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
    await db.eventFormat.create({
      data: {
        name: data.name,
        description: data.description,
        order: formatsCount,
        event: { connect: { id: event.id } },
      },
    });
  }

  async deleteFormat(formatId: string) {
    const { event } = await this.checkAuthorizedEvent('canEditEvent');

    const trackToDelete = await db.eventFormat.findUnique({ where: { id: formatId } });
    if (!trackToDelete) return;

    await db.$transaction(async (tx) => {
      await tx.eventFormat.delete({ where: { id: formatId } });
      await tx.eventFormat.updateMany({
        where: { eventId: event.id, order: { gt: trackToDelete.order } },
        data: { order: { decrement: 1 } },
      });
    });
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
    await db.eventCategory.create({
      data: {
        name: data.name,
        description: data.description,
        order: categoriesCount,
        event: { connect: { id: event.id } },
      },
    });
  }

  async deleteCategory(categoryId: string) {
    const { event } = await this.checkAuthorizedEvent('canEditEvent');

    const trackToDelete = await db.eventCategory.findUnique({ where: { id: categoryId } });
    if (!trackToDelete) return;

    await db.$transaction(async (tx) => {
      await tx.eventCategory.delete({ where: { id: categoryId } });
      await tx.eventCategory.updateMany({
        where: { eventId: event.id, order: { gt: trackToDelete.order } },
        data: { order: { decrement: 1 } },
      });
    });
  }

  async reorderFormat(formatId: string, direction: 'up' | 'down') {
    const { event } = await this.checkAuthorizedEvent('canEditEvent');

    const currentTrack = await db.eventFormat.findUnique({ where: { id: formatId } });
    if (!currentTrack) return;

    const targetOrder = direction === 'up' ? currentTrack.order - 1 : currentTrack.order + 1;
    if (targetOrder < 0) return;

    const maxOrder = await db.eventFormat.aggregate({ where: { eventId: event.id }, _max: { order: true } });
    if (maxOrder._max.order !== null && targetOrder > maxOrder._max.order) return;

    await db.$transaction(async (tx) => {
      if (targetOrder < currentTrack.order) {
        // Moving UP: increment tracks in range
        await tx.eventFormat.updateMany({
          where: { eventId: event.id, order: { gte: targetOrder, lt: currentTrack.order } },
          data: { order: { increment: 1 } },
        });
      } else {
        // Moving DOWN: decrement tracks in range
        await tx.eventFormat.updateMany({
          where: { eventId: event.id, order: { gt: currentTrack.order, lte: targetOrder } },
          data: { order: { decrement: 1 } },
        });
      }
      await tx.eventFormat.update({ where: { id: formatId }, data: { order: targetOrder } });
    });
  }

  async reorderCategory(categoryId: string, direction: 'up' | 'down') {
    const { event } = await this.checkAuthorizedEvent('canEditEvent');

    const currentTrack = await db.eventCategory.findUnique({ where: { id: categoryId } });
    if (!currentTrack) return;

    const targetOrder = direction === 'up' ? currentTrack.order - 1 : currentTrack.order + 1;
    if (targetOrder < 0) return;

    const maxOrder = await db.eventCategory.aggregate({ where: { eventId: event.id }, _max: { order: true } });
    if (maxOrder._max.order !== null && targetOrder > maxOrder._max.order) return;

    await db.$transaction(async (tx) => {
      if (targetOrder < currentTrack.order) {
        // Moving UP: increment tracks in range
        await tx.eventCategory.updateMany({
          where: { eventId: event.id, order: { gte: targetOrder, lt: currentTrack.order } },
          data: { order: { increment: 1 } },
        });
      } else {
        // Moving DOWN: decrement tracks in range
        await tx.eventCategory.updateMany({
          where: { eventId: event.id, order: { gt: currentTrack.order, lte: targetOrder } },
          data: { order: { decrement: 1 } },
        });
      }
      await tx.eventCategory.update({ where: { id: categoryId }, data: { order: targetOrder } });
    });
  }
}
