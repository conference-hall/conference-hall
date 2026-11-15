import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';
import type { CategorySaveData, FormatSaveData } from './event-tracks-settings.schema.server.ts';

export class EventTracksSettings {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new EventTracksSettings(authorizedEvent);
  }

  async saveFormat(data: FormatSaveData) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();

    if (data.id) {
      return db.eventFormat.update({
        where: { id: data.id },
        data: {
          name: data.name,
          description: data.description,
          durationInMinutes: data.durationInMinutes ?? null,
          color: data.color,
        },
      });
    }

    const formatsCount = await db.eventFormat.count({ where: { eventId: event.id } });
    await db.eventFormat.create({
      data: {
        name: data.name,
        description: data.description,
        durationInMinutes: data.durationInMinutes ?? null,
        color: data.color,
        order: formatsCount,
        event: { connect: { id: event.id } },
      },
    });
  }

  async deleteFormat(formatId: string) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();

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

  async saveCategory(data: CategorySaveData) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();

    if (data.id) {
      return db.eventCategory.update({
        where: { id: data.id },
        data: { name: data.name, description: data.description, color: data.color },
      });
    }

    const categoriesCount = await db.eventCategory.count({ where: { eventId: event.id } });
    await db.eventCategory.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        order: categoriesCount,
        event: { connect: { id: event.id } },
      },
    });
  }

  async deleteCategory(categoryId: string) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();

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

  async reorderFormat(formatId: string, targetIndex: number) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();

    await db.$transaction(async (tx) => {
      const currentTrack = await tx.eventFormat.findFirst({ where: { id: formatId, eventId: event.id } });
      if (!currentTrack) return;

      const count = await tx.eventFormat.count({ where: { eventId: event.id } });
      const targetOrder = Math.min(Math.max(targetIndex, 0), count - 1);
      if (targetOrder === currentTrack.order) return;

      if (targetOrder < currentTrack.order) {
        await tx.eventFormat.updateMany({
          where: { eventId: event.id, order: { gte: targetOrder, lt: currentTrack.order } },
          data: { order: { increment: 1 } },
        });
      } else {
        await tx.eventFormat.updateMany({
          where: { eventId: event.id, order: { gt: currentTrack.order, lte: targetOrder } },
          data: { order: { decrement: 1 } },
        });
      }
      await tx.eventFormat.update({ where: { id: formatId }, data: { order: targetOrder } });
    });
  }

  async reorderCategory(categoryId: string, targetIndex: number) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();

    await db.$transaction(async (tx) => {
      const currentTrack = await tx.eventCategory.findFirst({ where: { id: categoryId, eventId: event.id } });
      if (!currentTrack) return;

      const count = await tx.eventCategory.count({ where: { eventId: event.id } });
      const targetOrder = Math.min(Math.max(targetIndex, 0), count - 1);
      if (targetOrder === currentTrack.order) return;

      if (targetOrder < currentTrack.order) {
        await tx.eventCategory.updateMany({
          where: { eventId: event.id, order: { gte: targetOrder, lt: currentTrack.order } },
          data: { order: { increment: 1 } },
        });
      } else {
        await tx.eventCategory.updateMany({
          where: { eventId: event.id, order: { gt: currentTrack.order, lte: targetOrder } },
          data: { order: { decrement: 1 } },
        });
      }
      await tx.eventCategory.update({ where: { id: categoryId }, data: { order: targetOrder } });
    });
  }
}
