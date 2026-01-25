import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { Pagination } from '~/shared/pagination/pagination.ts';
import type { EventProposalTagWhereInput } from '../../../../../prisma/generated/models.ts';
import type { TagFilters, TagSaveData } from './event-proposal-tags.schema.server.ts';
import { db } from '../../../../../prisma/db.server.ts';

export class EventProposalTags {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new EventProposalTags(authorizedEvent);
  }

  async list(filters: TagFilters, page = 1, pageSize?: number) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();

    const tagsWhereInput: EventProposalTagWhereInput = {
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
      pagination: { current: pagination.page, pages: pagination.pageCount },
    };
  }

  async save(data: TagSaveData) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();

    if (data.id) {
      return db.eventProposalTag.update({ where: { id: data.id }, data: { name: data.name, color: data.color } });
    }

    return db.eventProposalTag.create({
      data: { name: data.name, color: data.color, event: { connect: { id: event.id } } },
    });
  }

  async delete(tagId: string) {
    const { permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();

    return db.eventProposalTag.delete({ where: { id: tagId } });
  }
}
