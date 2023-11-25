import { db } from '~/libs/db';
import { ProposalNotFoundError } from '~/libs/errors';
import { getSpeakerProposalStatus } from '~/routes/__server/proposals/get-speaker-proposal-status';

import { InvitationLink } from '../shared/InvitationLink';

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
}
