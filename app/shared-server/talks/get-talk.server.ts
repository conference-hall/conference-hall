import { jsonToArray } from '~/libs/prisma';
import { db } from '../../libs/db';
import { TalkNotFoundError } from '../../libs/errors';
import { buildInvitationLink } from '../invitations/build-link.server';
import { getSpeakerProposalStatus } from '../proposals/get-speaker-proposal-status';

export async function getTalk(uid: string, talkId: string) {
  const talk = await db.talk.findFirst({
    where: {
      speakers: { some: { id: uid } },
      id: talkId,
    },
    include: {
      speakers: true,
      proposals: { include: { event: true } },
      invitation: true,
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
    isOwner: uid === talk.creatorId,
    speakers: talk.speakers
      .map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        photoURL: speaker.photoURL,
        isOwner: speaker.id === talk.creatorId,
        isCurrentUser: speaker.id === uid,
      }))
      .sort((a, b) => (a.isOwner ? -1 : 0) - (b.isOwner ? -1 : 0)),
    submissions: talk.proposals.map((proposal) => ({
      slug: proposal.event.slug,
      name: proposal.event.name,
      proposalStatus: getSpeakerProposalStatus(proposal, proposal.event),
    })),
    invitationLink: buildInvitationLink(talk.invitation?.id),
  };
}
