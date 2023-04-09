import { db } from '~/libs/db';
import { SpeakerNotFoundError } from '~/libs/errors';
import { getSpeakerProposalStatus } from '~/shared-server/proposals/get-speaker-proposal-status';

const RESULTS_BATCH = 6;

export async function getActivity(speakerId: string, page: number = 1) {
  const speaker = await db.user.findUnique({ where: { id: speakerId } });

  if (!speaker) throw new SpeakerNotFoundError();

  const count = await db.proposal.count({ where: { speakers: { some: { id: speakerId } } } });

  const activities = await db.proposal.findMany({
    where: { speakers: { some: { id: speakerId } } },
    include: { speakers: true, event: true },
    orderBy: { updatedAt: 'desc' },
    take: page * RESULTS_BATCH,
  });

  const hasNextPage = activities.length < count;

  return {
    activities: activities.map((proposal) => ({
      id: proposal.id,
      title: proposal.title,
      updatedAt: proposal.updatedAt.toUTCString(),
      status: getSpeakerProposalStatus(proposal, proposal.event),
      speakers: proposal.speakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        photoURL: speaker.photoURL,
      })),
      event: {
        slug: proposal.event.slug,
        name: proposal.event.name,
      },
    })),
    hasNextPage,
    nextPage: page + 1,
  };
}
