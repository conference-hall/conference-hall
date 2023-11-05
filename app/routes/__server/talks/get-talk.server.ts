import { db } from '~/libs/db.ts';
import { TalkNotFoundError } from '~/libs/errors.ts';
import { jsonToArray } from '~/libs/prisma.ts';

import { buildInvitationLink } from '../invitations/build-link.server.ts';
import { getSpeakerProposalStatus } from '../proposals/get-speaker-proposal-status.ts';

export async function getTalk(userId: string, talkId: string) {
  const talk = await db.talk.findFirst({
    where: {
      speakers: { some: { id: userId } },
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
    isOwner: userId === talk.creatorId,
    speakers: talk.speakers
      .map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        picture: speaker.picture,
        company: speaker.company,
        isOwner: speaker.id === talk.creatorId,
        isCurrentUser: speaker.id === userId,
      }))
      .sort((a, b) => (a.isOwner ? -1 : 0) - (b.isOwner ? -1 : 0)),
    submissions: talk.proposals.map((proposal) => ({
      slug: proposal.event.slug,
      name: proposal.event.name,
      logo: proposal.event.logo,
      proposalStatus: getSpeakerProposalStatus(proposal, proposal.event),
    })),
    invitationLink: buildInvitationLink('talk', talk.invitationCode),
  };
}
