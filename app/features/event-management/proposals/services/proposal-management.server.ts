import { db } from 'prisma/db.server.ts';
import { UserEventAuthorization } from '~/shared/user/user-event-authorization.server.ts';
import type {
  ProposalSaveTagsData,
  ProposalUpdateData,
  TalkProposalCreationData,
} from './proposal-management.schema.server.ts';

export class ProposalManagement extends UserEventAuthorization {
  private proposalId?: string;

  constructor(userId: string, teamSlug: string, eventSlug: string, proposalId?: string) {
    super(userId, teamSlug, eventSlug);
    this.proposalId = proposalId;
  }

  static for(userId: string, teamSlug: string, eventSlug: string, proposalId?: string) {
    return new ProposalManagement(userId, teamSlug, eventSlug, proposalId);
  }

  async create(data: TalkProposalCreationData) {
    const event = await this.needsPermission('canCreateEventProposal');

    return await db.$transaction(async (trx) => {
      const formatsConnect = data.formats?.length
        ? { connect: data.formats.map((formatId) => ({ id: formatId })) }
        : undefined;

      const categoriesConnect = data.categories?.length
        ? { connect: data.categories.map((categoryId) => ({ id: categoryId })) }
        : undefined;

      const tagsConnect = data.tags?.length ? { connect: data.tags.map((tagId) => ({ id: tagId })) } : undefined;

      const proposal = await trx.proposal.create({
        data: {
          title: data.title,
          abstract: data.abstract,
          references: data.references,
          languages: data.languages,
          level: data.level,
          event: { connect: { id: event.id } },
          speakers: { connect: data.speakers.map((id) => ({ id })) }, // todo(proposal): check the speakers belongs to event before saving
          formats: formatsConnect,
          categories: categoriesConnect,
          tags: tagsConnect,
          isDraft: false,
        },
      });

      return { id: proposal.id };
    });
  }

  async update(data: ProposalUpdateData) {
    if (!this.proposalId) throw new Error('Proposal ID is required for update operation');

    await this.needsPermission('canEditEventProposals');

    const { formats, categories, ...talk } = data;
    return db.proposal.update({
      where: { id: this.proposalId },
      data: {
        ...talk,
        formats: { set: [], connect: formats?.map((id) => ({ id })) },
        categories: { set: [], connect: categories?.map((id) => ({ id })) },
      },
    });
  }

  async saveTags(data: ProposalSaveTagsData) {
    if (!this.proposalId) throw new Error('Proposal ID is required for saveTags operation');

    await this.needsPermission('canEditEventProposals');

    return db.proposal.update({
      where: { id: this.proposalId },
      data: { tags: { set: [], connect: data.tags?.map((id) => ({ id })) } },
    });
  }
}
