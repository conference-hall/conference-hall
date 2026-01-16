import { db } from 'prisma/db.server.ts';
import type { EventEmailNotificationsKeys } from '~/shared/types/events.types.ts';
import type { Languages } from '~/shared/types/proposals.types.ts';
import type { TalkSaveData, TracksSaveData } from '~/shared/types/speaker-talk.types.ts';
import { EventSpeakerForProposal } from '~/features/event-participation/speaker-proposals/services/event-speaker-for-proposal.ts';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import ProposalConfirmedEmail from '~/shared/emails/templates/organizers/proposal-confirmed.tsx';
import ProposalDeclinedEmail from '~/shared/emails/templates/organizers/proposal-declined.tsx';
import { CfpNotOpenError, ProposalNotFoundError } from '~/shared/errors.server.ts';

export class SpeakerProposal {
  constructor(
    private userId: string,
    private proposalId: string,
  ) {}

  static for(userId: string, proposalId: string) {
    return new SpeakerProposal(userId, proposalId);
  }

  async get() {
    const proposal = await db.proposal.findFirst({
      where: { speakers: { some: { userId: this.userId } }, id: this.proposalId },
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
      status: proposal.getStatusForSpeaker(proposal.event.isCfpOpen),
      submittedAt: proposal.submittedAt,
      languages: proposal.languages as Languages,
      formats: proposal.formats.map(({ id, name }) => ({ id, name })),
      categories: proposal.categories.map(({ id, name }) => ({ id, name })),
      invitationLink: proposal.invitationLink,
      isOwner: this.userId === proposal?.talk?.creatorId,
      speakers: proposal.speakers.map((speaker) => ({
        userId: speaker.userId,
        name: speaker.name,
        bio: speaker.bio,
        picture: speaker.picture,
        company: speaker.company,
        isCurrentUser: this.userId === speaker.userId,
      })),
    };
  }

  async update(data: TalkSaveData & TracksSaveData) {
    const proposal = await db.proposal.findFirst({
      where: { id: this.proposalId, speakers: { some: { userId: this.userId } } },
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

  async removeCoSpeaker(coSpeakerUserId: string) {
    const proposal = await db.proposal.findFirst({
      where: { id: this.proposalId, speakers: { some: { userId: this.userId } } },
    });
    if (!proposal) throw new ProposalNotFoundError();

    await EventSpeakerForProposal.for(proposal.eventId).removeSpeakerFromProposal(this.proposalId, coSpeakerUserId);
  }

  async delete() {
    await db.proposal.deleteMany({
      where: { id: this.proposalId, speakers: { some: { userId: this.userId } } },
    });
  }

  async confirm(participation: 'CONFIRMED' | 'DECLINED') {
    const proposal = await db.proposal.findFirst({
      where: { id: this.proposalId, speakers: { some: { userId: this.userId } } },
      include: { event: { include: { team: true } }, speakers: true },
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

    if (!proposal.event.emailOrganizer) return;

    // send email to organizers
    const emailNotifications = proposal.event.emailNotifications as EventEmailNotificationsKeys;
    if (participation === 'CONFIRMED' && emailNotifications.includes('confirmed')) {
      await sendEmail.trigger(ProposalConfirmedEmail.buildPayload({ event: proposal.event, proposal }));
    } else if (participation === 'DECLINED' && emailNotifications.includes('declined')) {
      await sendEmail.trigger(ProposalDeclinedEmail.buildPayload({ event: proposal.event, proposal }));
    }
  }
}
