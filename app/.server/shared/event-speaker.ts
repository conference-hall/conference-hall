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
    const speaker = await this.trx.speaker.findFirst({ where: { userId: user.id, eventId: this.eventId } });
    if (speaker) {
      return this.trx.speaker.update({
        where: { id: speaker.id },
        data: {
          eventId: this.eventId,
          email: user.email,
          name: user.name,
          bio: user.bio,
          picture: user.picture,
          company: user.company,
          location: user.location,
          socialLinks: user.socialLinks as SocialLinks,
        },
      });
    }

    return this.trx.speaker.create({
      data: {
        userId: user.id,
        eventId: this.eventId,
        email: user.email,
        name: user.name,
        bio: user.bio,
        picture: user.picture,
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

    // TEMP: Double-write speakers to legacy and new tables
    const newSpeaker = await this.upsertForUser(user);

    return this.trx.proposal.update({
      where: { id: proposalId },
      data: {
        legacySpeakers: { connect: { id: userId } },
        newSpeakers: { connect: { id: newSpeaker.id } },
      },
    });
  }

  async removeSpeakerFromProposal(proposalId: string, userId: string) {
    // TEMP: Double-write speakers to legacy and new tables
    const newSpeaker = await this.trx.speaker.findFirst({ where: { userId, eventId: this.eventId } });

    // TODO: check remains at least one speaker

    await this.trx.proposal.update({
      where: { id: proposalId },
      data: {
        legacySpeakers: { disconnect: { id: userId } },
        newSpeakers: newSpeaker ? { disconnect: { id: newSpeaker.id } } : undefined,
      },
    });
    // TEMP: check event speakers to delete from event ?
  }
}
