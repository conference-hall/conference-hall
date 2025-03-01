import { db } from 'prisma/db.server.ts';

import { CfpNotOpenError, ProposalNotFoundError } from '~/libs/errors.server.ts';

import { sendProposalConfirmedEmailToOrganizers } from '~/emails/templates/organizers/proposal-confirmed.tsx';
import { sendProposalDeclinedEmailToOrganizers } from '~/emails/templates/organizers/proposal-declined.tsx';
import type { ProposalSaveData } from './user-proposal.types';

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
      where: { legacySpeakers: { some: { id: this.speakerId } }, id: this.proposalId },
      include: {
        event: true,
        legacySpeakers: true,
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
      status: proposal.getStatusForSpeaker(proposal.event.isCfpOpen),
      createdAt: proposal.createdAt,
      languages: proposal.languages as string[],
      formats: proposal.formats.map(({ id, name }) => ({ id, name })),
      categories: proposal.categories.map(({ id, name }) => ({ id, name })),
      invitationLink: proposal.invitationLink,
      isOwner: this.speakerId === proposal?.talk?.creatorId,
      speakers: proposal.legacySpeakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        bio: speaker.bio,
        picture: speaker.picture,
        company: speaker.company,
        isCurrentUser: this.speakerId === speaker.id,
      })),
    };
  }

  async update(data: ProposalSaveData) {
    const proposal = await db.proposal.findFirst({
      where: { id: this.proposalId, legacySpeakers: { some: { id: this.speakerId } } },
      include: { event: true },
    });
    if (!proposal) throw new ProposalNotFoundError();
    if (!proposal.event.isCfpOpen) throw new CfpNotOpenError();

    const { formats, categories, ...talk } = data;
    await db.proposal.update({
      where: { id: this.proposalId },
      data: {
        ...talk,
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
        legacySpeakers: { some: { id: this.speakerId } },
      },
    });
    if (!proposal) throw new ProposalNotFoundError();

    await db.proposal.update({
      where: { id: this.proposalId },
      data: { legacySpeakers: { disconnect: { id: coSpeakerId } } },
    });
  }

  async delete() {
    await db.proposal.deleteMany({
      where: { id: this.proposalId, legacySpeakers: { some: { id: this.speakerId } } },
    });
  }

  async confirm(participation: 'CONFIRMED' | 'DECLINED') {
    const proposal = await db.proposal.findFirst({
      where: { id: this.proposalId, legacySpeakers: { some: { id: this.speakerId } } },
      include: { event: { include: { team: true } }, legacySpeakers: true },
    });
    if (!proposal) throw new ProposalNotFoundError();

    const result = await db.proposal.updateMany({
      where: {
        id: this.proposalId,
        deliberationStatus: 'ACCEPTED',
        publicationStatus: 'PUBLISHED',
        confirmationStatus: 'PENDING',
      },
      data: { confirmationStatus: participation },
    });

    if (result.count <= 0) return;

    if (participation === 'CONFIRMED') {
      await sendProposalConfirmedEmailToOrganizers({ event: proposal.event, proposal });
    } else if (participation === 'DECLINED') {
      await sendProposalDeclinedEmailToOrganizers({ event: proposal.event, proposal });
    }
  }
}
