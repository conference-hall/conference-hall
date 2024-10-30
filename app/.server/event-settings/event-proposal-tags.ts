import { db } from 'prisma/db.server.ts';

import type { Prisma } from '@prisma/client';
import { Pagination } from '../shared/pagination.ts';
import type { TagFilters, TagSaveData } from './event-proposal-tags.types.ts';
import { UserEvent } from './user-event.ts';

export class EventProposalTags extends UserEvent {
  static for(userId: string, teamSlug: string, eventSlug: string) {
    return new EventProposalTags(userId, teamSlug, eventSlug);
  }

  async list(filters: TagFilters, page = 1, pageSize?: number) {
    const event = await this.needsPermission('canEditEvent');

    const tagsWhereInput: Prisma.EventProposalTagWhereInput = {
      eventId: event.id,
      name: { contains: filters.query, mode: 'insensitive' },
    };

    const count = await db.eventProposalTag.count({ where: tagsWhereInput });
    const pagination = new Pagination({ page, pageSize, total: count });

    const tags = await db.eventProposalTag.findMany({
      where: tagsWhereInput,
      orderBy: { name: 'asc' },
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
    });

    return {
      count,
      tags: tags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color })),
      pagination: { current: pagination.page, total: pagination.pageCount },
    };
  }

  async save(data: TagSaveData) {
    const event = await this.needsPermission('canEditEvent');

    if (data.id) {
      return db.eventProposalTag.update({
        where: { id: data.id },
        data: { name: data.name, color: data.color },
      });
    }

    return db.eventProposalTag.create({
      data: { name: data.name, color: data.color, event: { connect: { id: event.id } } },
    });
  }

  async delete(tagId: string) {
    await this.needsPermission('canEditEvent');

    return db.eventProposalTag.delete({ where: { id: tagId } });
  }
}
