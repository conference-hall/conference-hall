import type { User } from '@prisma/client';
import { type DbTransaction, db } from 'prisma/db.server.ts';
import { UserNotFoundError } from '~/libs/errors.server.ts';
import type { SocialLinks } from '../speaker-profile/speaker-profile.types.ts';

export class EventSpeaker {
  constructor(
    private eventId: string,
    private trx: DbTransaction,
  ) {}

  static for(eventId: string, trx: DbTransaction = db) {
    return new EventSpeaker(eventId, trx);
  }

  async upsertForUser(user: User) {
    const speaker = await this.trx.eventSpeaker.findFirst({ where: { userId: user.id, eventId: this.eventId } });
    if (speaker) {
      return this.trx.eventSpeaker.update({
        where: { id: speaker.id },
        data: {
          eventId: this.eventId,
          email: user.email,
          name: user.name,
          picture: user.picture,
          bio: user.bio,
          references: user.references,
          company: user.company,
          location: user.location,
          socialLinks: user.socialLinks as SocialLinks,
        },
      });
    }

    return this.trx.eventSpeaker.create({
      data: {
        userId: user.id,
        eventId: this.eventId,
        email: user.email,
        name: user.name,
        picture: user.picture,
        bio: user.bio,
        references: user.references,
        company: user.company,
        location: user.location,
        socialLinks: user.socialLinks as SocialLinks,
      },
    });
  }

  async upsertForUsers(users: Array<User>) {
    if (users.length <= 0) return [];

    const speakers = [];

    for (const user of users) {
      const speaker = await this.upsertForUser(user);
      speakers.push(speaker);
    }

    return speakers;
  }

  async addSpeakerToProposal(proposalId: string, userId: string) {
    const user = await this.trx.user.findUnique({ where: { id: userId } });
    if (!user) throw new UserNotFoundError();

    const newSpeaker = await this.upsertForUser(user);

    return this.trx.proposal.update({
      where: { id: proposalId },
      data: { newSpeakers: { connect: { id: newSpeaker.id } } },
    });
  }

  async removeSpeakerFromProposal(proposalId: string, userId: string) {
    const newSpeaker = await this.trx.eventSpeaker.findFirst({ where: { userId, eventId: this.eventId } });

    // TODO: throw error if speaker not found ?
    // TODO: check remains at least one speaker

    await this.trx.proposal.update({
      where: { id: proposalId },
      data: { newSpeakers: newSpeaker ? { disconnect: { id: newSpeaker.id } } : undefined },
    });

    // TEMP: check event speakers to delete from event ?
  }
}
