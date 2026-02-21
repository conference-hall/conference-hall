import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { getNextProposalNumber } from '~/shared/counters/proposal-counter.server.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';
import type {
  ProposalCreationData,
  ProposalSaveCategoriesData,
  ProposalSaveFormatsData,
  ProposalSaveSpeakersData,
  ProposalSaveTagsData,
  ProposalUpdateData,
} from './proposal-management.schema.server.ts';

export class ProposalManagement {
  constructor(
    private authorizedEvent: AuthorizedEvent,
    private proposalId?: string,
  ) {}

  static for(authorizedEvent: AuthorizedEvent, proposalId?: string) {
    return new ProposalManagement(authorizedEvent, proposalId);
  }

  async canCreate() {
    const { permissions } = this.authorizedEvent;
    if (!permissions.canCreateEventProposal) throw new ForbiddenOperationError();
    return this.authorizedEvent;
  }

  async create(data: ProposalCreationData) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canCreateEventProposal) throw new ForbiddenOperationError();

    return await db.$transaction(async (trx) => {
      const formatsConnect = data.formats?.length
        ? { connect: data.formats.map((formatId) => ({ id: formatId })) }
        : undefined;

      const categoriesConnect = data.categories?.length
        ? { connect: data.categories.map((categoryId) => ({ id: categoryId })) }
        : undefined;

      const tagsConnect = data.tags?.length ? { connect: data.tags.map((tagId) => ({ id: tagId })) } : undefined;

      const eventSpeakers = await db.eventSpeaker.findMany({
        where: { eventId: event.id, id: { in: data.speakers } },
        select: { id: true },
      });

      if (eventSpeakers.length === 0) {
        throw new Error(`Speakers with IDs ${data.speakers.join(', ')} do not belong to this event`);
      }

      const proposalNumber = await getNextProposalNumber(event.id, trx);

      const proposal = await trx.proposal.create({
        data: {
          title: data.title,
          abstract: data.abstract,
          references: data.references,
          languages: data.languages,
          level: data.level,
          event: { connect: { id: event.id } },
          speakers: { connect: eventSpeakers },
          formats: formatsConnect,
          categories: categoriesConnect,
          tags: tagsConnect,
          isDraft: false,
          proposalNumber,
        },
      });

      return proposal;
    });
  }

  async update(data: ProposalUpdateData) {
    if (!this.proposalId) throw new Error('Proposal ID is required for update operation');

    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEventProposal) throw new ForbiddenOperationError();

    return db.proposal.update({ where: { id: this.proposalId, eventId: event.id }, data });
  }

  async saveTags(data: ProposalSaveTagsData) {
    if (!this.proposalId) throw new Error('Proposal ID is required for saveTags operation');

    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEventProposal) throw new ForbiddenOperationError();

    return db.proposal.update({
      where: { id: this.proposalId, eventId: event.id },
      data: { tags: { set: [], connect: data.tags?.map((id) => ({ id })) } },
    });
  }

  async saveSpeakers(data: ProposalSaveSpeakersData) {
    if (!this.proposalId) throw new Error('Proposal ID is required for saveSpeakers operation');

    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEventProposal) throw new ForbiddenOperationError();

    const eventSpeakers = await db.eventSpeaker.findMany({
      where: { eventId: event.id, id: { in: data.speakers } },
      select: { id: true },
    });

    const validSpeakerIds = eventSpeakers.map((s) => s.id);
    const invalidSpeakers = data.speakers.filter((id) => !validSpeakerIds.includes(id));

    if (invalidSpeakers.length > 0) {
      throw new Error(`Speakers with IDs ${invalidSpeakers.join(', ')} do not belong to this event`);
    }

    return db.proposal.update({
      where: { id: this.proposalId, eventId: event.id },
      data: { speakers: { set: [], connect: data.speakers.map((id) => ({ id })) } },
    });
  }

  async saveFormats(data: ProposalSaveFormatsData) {
    if (!this.proposalId) throw new Error('Proposal ID is required for saveFormats operation');

    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEventProposal) throw new ForbiddenOperationError();

    const eventFormats = await db.eventFormat.findMany({
      where: { eventId: event.id, id: { in: data.formats } },
      select: { id: true },
    });

    const validFormatIds = eventFormats.map((f) => f.id);
    const invalidFormats = data.formats.filter((id) => !validFormatIds.includes(id));

    if (invalidFormats.length > 0) {
      throw new Error(`Formats with IDs ${invalidFormats.join(', ')} do not belong to this event`);
    }

    return db.proposal.update({
      where: { id: this.proposalId, eventId: event.id },
      data: { formats: { set: [], connect: data.formats.map((id) => ({ id })) } },
    });
  }

  async saveCategories(data: ProposalSaveCategoriesData) {
    if (!this.proposalId) throw new Error('Proposal ID is required for saveCategories operation');

    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEventProposal) throw new ForbiddenOperationError();

    const eventCategories = await db.eventCategory.findMany({
      where: { eventId: event.id, id: { in: data.categories } },
      select: { id: true },
    });

    const validCategoryIds = eventCategories.map((c) => c.id);
    const invalidCategories = data.categories.filter((id) => !validCategoryIds.includes(id));

    if (invalidCategories.length > 0) {
      throw new Error(`Categories with IDs ${invalidCategories.join(', ')} do not belong to this event`);
    }

    return db.proposal.update({
      where: { id: this.proposalId, eventId: event.id },
      data: { categories: { set: [], connect: data.categories.map((id) => ({ id })) } },
    });
  }
}
