import { getSpeakerProposalStatus } from '~/domains/cfp-submissions/get-speaker-proposal-status';
import { db } from '~/libs/db';
import { TalkNotFoundError } from '~/libs/errors';
import { jsonToArray } from '~/libs/prisma';

import { InvitationLink } from '../shared/InvitationLink';
import type { TalkSaveData } from './TalksLibrary.types';

export class SpeakerTalk {
  constructor(
    private speakerId: string,
    private talkId: string,
  ) {}

  static for(speakerId: string, talkId: string) {
    return new SpeakerTalk(speakerId, talkId);
  }

  async get() {
    const talk = await db.talk.findFirst({
      where: {
        speakers: { some: { id: this.speakerId } },
        id: this.talkId,
      },
      include: {
        speakers: true,
        proposals: { include: { event: true, result: true } },
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
      isOwner: this.speakerId === talk.creatorId,
      speakers: talk.speakers
        .map((speaker) => ({
          id: speaker.id,
          name: speaker.name,
          picture: speaker.picture,
          company: speaker.company,
          isOwner: speaker.id === talk.creatorId,
          isCurrentUser: speaker.id === this.speakerId,
        }))
        .sort((a, b) => (a.isOwner ? -1 : 0) - (b.isOwner ? -1 : 0)),
      submissions: talk.proposals.map((proposal) => ({
        slug: proposal.event.slug,
        name: proposal.event.name,
        logo: proposal.event.logo,
        proposalStatus: getSpeakerProposalStatus(
          proposal.deliberationStatus,
          proposal.confirmationStatus,
          proposal.isDraft,
          Boolean(proposal.result),
        ),
      })),
      invitationLink: InvitationLink.build('talk', talk.invitationCode),
    };
  }

  async update(data: TalkSaveData) {
    const exists = await this.existsTalk(this.talkId);
    if (!exists) throw new TalkNotFoundError();

    return db.talk.update({ where: { id: this.talkId }, data, include: { speakers: true } });
  }

  async archive() {
    const exists = await this.existsTalk(this.talkId);
    if (!exists) throw new TalkNotFoundError();

    return db.talk.update({ where: { id: this.talkId }, data: { archived: true } });
  }

  async restore() {
    const exits = await this.existsTalk(this.talkId);
    if (!exits) throw new TalkNotFoundError();

    return db.talk.update({ where: { id: this.talkId }, data: { archived: false } });
  }

  async removeCoSpeaker(coSpeakerId: string) {
    const exits = await this.existsTalk(this.talkId);
    if (!exits) throw new TalkNotFoundError();

    await db.talk.update({
      where: { id: this.talkId },
      data: { speakers: { disconnect: { id: coSpeakerId } } },
    });
  }

  // TODO: add tests
  async isSubmittedTo(eventSlug: string) {
    const count = await db.proposal.count({
      where: {
        talk: { id: this.talkId },
        event: { slug: eventSlug },
        speakers: { some: { id: this.speakerId } },
        isDraft: false,
      },
    });
    return count > 0;
  }

  // TODO: should be used to check the talkId in the route? renamed to "allowed"?
  private async existsTalk(talkId: string) {
    const count = await db.talk.count({ where: { id: talkId, speakers: { some: { id: this.speakerId } } } });
    return count > 0;
  }
}
