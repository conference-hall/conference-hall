import { z } from 'zod';

import { db } from '~/libs/db';
import { TalkNotFoundError } from '~/libs/errors';
import { jsonToArray } from '~/libs/prisma';
import { getSpeakerProposalStatus } from '~/routes/__server/proposals/get-speaker-proposal-status';

import { InvitationLink } from '../shared/InvitationLink';

type TalksListOptions = { archived?: boolean };

export class TalksLibrary {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new TalksLibrary(userId);
  }

  static TalkSchema = z.object({
    title: z.string().trim().min(1),
    abstract: z.string().trim().min(1),
    references: z.string().nullable().default(null),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable().default(null),
    languages: z.array(z.string()),
  });

  async list(options: TalksListOptions = { archived: false }) {
    const talks = await db.talk.findMany({
      where: {
        speakers: { some: { id: this.userId } },
        archived: Boolean(options.archived),
      },
      include: { speakers: true },
      orderBy: { updatedAt: 'desc' },
    });

    return talks.map((talk) => ({
      id: talk.id,
      title: talk.title,
      archived: talk.archived,
      createdAt: talk.createdAt.toUTCString(),
      speakers: talk.speakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        picture: speaker.picture,
      })),
    }));
  }

  async get(talkId: string) {
    const talk = await db.talk.findFirst({
      where: {
        speakers: { some: { id: this.userId } },
        id: talkId,
      },
      include: {
        speakers: true,
        proposals: { include: { event: true } },
      },
    });
    if (!talk) throw new TalkNotFoundError();

    return {
      id: talk.id,
      title: talk.title,
      abstract: talk.abstract,
      level: talk.level,
      languages: jsonToArray(talk.languages),
      references: talk.references,
      archived: talk.archived,
      createdAt: talk.createdAt.toUTCString(),
      isOwner: this.userId === talk.creatorId,
      speakers: talk.speakers
        .map((speaker) => ({
          id: speaker.id,
          name: speaker.name,
          picture: speaker.picture,
          company: speaker.company,
          isOwner: speaker.id === talk.creatorId,
          isCurrentUser: speaker.id === this.userId,
        }))
        .sort((a, b) => (a.isOwner ? -1 : 0) - (b.isOwner ? -1 : 0)),
      submissions: talk.proposals.map((proposal) => ({
        slug: proposal.event.slug,
        name: proposal.event.name,
        logo: proposal.event.logo,
        proposalStatus: getSpeakerProposalStatus(proposal, proposal.event),
      })),
      invitationLink: InvitationLink.build('talk', talk.invitationCode),
    };
  }

  async add(data: z.infer<typeof TalksLibrary.TalkSchema>) {
    return db.talk.create({
      data: {
        ...data,
        creator: { connect: { id: this.userId } },
        speakers: { connect: [{ id: this.userId }] },
      },
    });
  }

  async update(talkId: string, data: z.infer<typeof TalksLibrary.TalkSchema>) {
    const exists = await this.existsTalk(talkId);
    if (!exists) throw new TalkNotFoundError();

    return db.talk.update({ where: { id: talkId }, data });
  }

  async archive(talkId: string) {
    const exists = await this.existsTalk(talkId);
    if (!exists) throw new TalkNotFoundError();

    return db.talk.update({ where: { id: talkId }, data: { archived: true } });
  }

  async restore(talkId: string) {
    const exits = await this.existsTalk(talkId);
    if (!exits) throw new TalkNotFoundError();

    return db.talk.update({ where: { id: talkId }, data: { archived: false } });
  }

  async removeCoSpeaker(talkId: string, coSpeakerId: string) {
    const exits = await this.existsTalk(talkId);
    if (!exits) throw new TalkNotFoundError();

    await db.talk.update({
      where: { id: talkId },
      data: { speakers: { disconnect: { id: coSpeakerId } } },
    });
  }

  // TODO: should be used to check the talkId in the route? renamed to "allowed"?
  private async existsTalk(talkId: string) {
    const count = await db.talk.count({ where: { id: talkId, speakers: { some: { id: this.userId } } } });
    return count > 0;
  }
}
