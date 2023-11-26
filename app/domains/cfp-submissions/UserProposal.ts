import { getSpeakerProposalStatus } from '~/domains/cfp-submissions/get-speaker-proposal-status';
import { db } from '~/libs/db';
import { CfpNotOpenError, ProposalNotFoundError } from '~/libs/errors';

import { CallForPaper } from '../shared/CallForPaper';
import { InvitationLink } from '../shared/InvitationLink';
import { ProposalConfirmedEmail } from './emails/proposal-confirmed-email';
import { ProposalDeclinedEmail } from './emails/proposal-declined-email';
import type { ProposalSaveData } from './UserProposal.types';

export class UserProposal {
  constructor(
    private speakerId: string,
    private proposalId: string,
  ) {}

  static for(speakerId: string, proposalId: string) {
    return new UserProposal(speakerId, proposalId);
  }

  async get() {
    const proposal = await db.proposal.findFirst({
      where: { speakers: { some: { id: this.speakerId } }, id: this.proposalId },
      include: {
        event: true,
        speakers: true,
        formats: true,
        categories: true,
        talk: true,
      },
    });

    if (!proposal) throw new ProposalNotFoundError();

    return {
      id: proposal.id,
      talkId: proposal.talkId,
      title: proposal.title,
      abstract: proposal.abstract,
      level: proposal.level,
      references: proposal.references,
      status: getSpeakerProposalStatus(proposal, proposal.event),
      createdAt: proposal.createdAt.toUTCString(),
      languages: proposal.languages as string[],
      formats: proposal.formats.map(({ id, name }) => ({ id, name })),
      categories: proposal.categories.map(({ id, name }) => ({ id, name })),
      invitationLink: InvitationLink.build('proposal', proposal.invitationCode),
      speakers: proposal.speakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        picture: speaker.picture,
        company: speaker.company,
        isOwner: speaker.id === proposal?.talk?.creatorId,
      })),
    };
  }

  async update(data: ProposalSaveData) {
    const proposal = await db.proposal.findFirst({
      where: { id: this.proposalId, speakers: { some: { id: this.speakerId } } },
      include: { event: true },
    });
    if (!proposal) throw new ProposalNotFoundError();

    const cfp = new CallForPaper(proposal.event);
    if (!cfp.isOpen) throw new CfpNotOpenError();

    const { formats, categories, ...talk } = data;
    await db.proposal.update({
      where: { id: this.proposalId },
      data: {
        ...talk,
        speakers: { set: [], connect: [{ id: this.speakerId }] },
        formats: { set: [], connect: formats?.map((id) => ({ id })) },
        categories: { set: [], connect: categories?.map((id) => ({ id })) },
      },
    });

    if (proposal.talkId) {
      await db.talk.update({
        where: { id: proposal.talkId },
        data: talk,
      });
    }
  }

  async removeCoSpeaker(coSpeakerId: string) {
    const proposal = await db.proposal.findFirst({
      where: {
        id: this.proposalId,
        speakers: { some: { id: this.speakerId } },
      },
    });
    if (!proposal) throw new ProposalNotFoundError();

    await db.proposal.update({
      where: { id: this.proposalId },
      data: { speakers: { disconnect: { id: coSpeakerId } } },
    });
  }

  async delete() {
    await db.proposal.deleteMany({
      where: { id: this.proposalId, speakers: { some: { id: this.speakerId } } },
    });
  }

  async confirm(participation: 'CONFIRMED' | 'DECLINED') {
    const proposal = await db.proposal.findFirst({
      where: { id: this.proposalId, speakers: { some: { id: this.speakerId } } },
      include: { event: true },
    });
    if (!proposal) throw new ProposalNotFoundError();

    const result = await db.proposal.updateMany({
      where: { id: this.proposalId, status: 'ACCEPTED' },
      data: { status: participation },
    });

    if (result.count <= 0) return;

    if (participation === 'CONFIRMED') {
      await ProposalConfirmedEmail.send(proposal.event, proposal);
    } else if (participation === 'DECLINED') {
      await ProposalDeclinedEmail.send(proposal.event, proposal);
    }
  }
}
