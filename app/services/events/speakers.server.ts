import { db } from '../db';
import {  ProposalNotFoundError } from '../errors';

export interface ProposalSpeakers {
  id: string;
  isOwner: boolean;
  speakers: Array<{
    id: string;
    name: string | null;
    photoURL: string | null;
    isOwner: boolean;
  }>;
}

/**
 * Get speakers of a proposal for an event
 * @param talkId Id of the talk
 * @param eventSlug Slig of the event
 * @param uid Id of the connected user
 * @returns SpeakerTalk
 */
export async function getProposalSpeakers(talkId: string, eventSlug: string, uid: string): Promise<ProposalSpeakers> {
  const proposal = await db.proposal.findFirst({
    select: { id: true, speakers: true, talk: { select: { creatorId: true } } },
    where: { talkId, event: { slug: eventSlug }, speakers: { some: { id: uid } } },
  });
  if (!proposal) throw new ProposalNotFoundError();

  return {
    id: proposal.id,
    isOwner: uid === proposal?.talk?.creatorId,
    speakers: proposal.speakers
      .map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        photoURL: speaker.photoURL,
        isOwner: speaker.id === proposal?.talk?.creatorId,
      }))
      .sort((a, b) => (a.isOwner ? -1 : 0) - (b.isOwner ? -1 : 0)),
  };
}
