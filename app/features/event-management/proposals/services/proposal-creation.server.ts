import { db } from 'prisma/db.server.ts';
import { EventSpeaker } from '~/features/event-participation/speaker-proposals/services/event-speaker.ts';
import { UserNotFoundError } from '~/shared/errors.server.ts';
import { UserEventAuthorization } from '~/shared/user/user-event-authorization.server.ts';
import type { TalkProposalCreationData } from './proposal-creation.schema.server.ts';

export class ProposalCreation extends UserEventAuthorization {
  static for(userId: string, teamSlug: string, eventSlug: string) {
    return new ProposalCreation(userId, teamSlug, eventSlug);
  }

  async create(data: TalkProposalCreationData) {
    const event = await this.needsPermission('canCreateEventProposal');

    return await db.$transaction(async (trx) => {
      // todo(proposal): how to set/create the speakers
      const user = await trx.user.findUnique({ where: { id: this.userId } });
      if (!user) throw new UserNotFoundError();

      const eventSpeaker = await EventSpeaker.for(event.id, trx).upsertForUser(user);

      const formatsConnect = data.formats?.length
        ? { connect: data.formats.map((formatId) => ({ id: formatId })) }
        : undefined;

      const categoriesConnect = data.categories?.length
        ? { connect: data.categories.map((categoryId) => ({ id: categoryId })) }
        : undefined;

      const proposal = await trx.proposal.create({
        data: {
          title: data.title,
          abstract: data.abstract,
          references: data.references,
          languages: data.languages,
          level: data.level,
          event: { connect: { id: event.id } },
          speakers: { connect: [{ id: eventSpeaker.id }] },
          formats: formatsConnect,
          categories: categoriesConnect,
          isDraft: false,
        },
      });

      return { id: proposal.id };
    });
  }
}
