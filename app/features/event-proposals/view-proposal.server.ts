import { db } from '../../services/db';
import { jsonToArray } from '../../utils/prisma';

export type SpeakerProposal = {
  id: string;
  talkId: string | null;
  title: string;
  abstract: string;
  status: string;
  level: string | null;
  references: string | null;
  createdAt: string;
  languages: string[];
  formats: string[];
  categories: string[];
  speakers: Array<{ id: string; name: string | null; photoURL: string | null }>;
};

export async function getSpeakerProposal(proposalId: string, uid: string) {
  const proposal = await db.proposal.findFirst({
    where: {
      speakers: { some: { id: uid } },
      id: proposalId,
    },
    include: { speakers: true, formats: true, categories: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!proposal) throw new ProposalNotFoundError();

  return {
    id: proposal.id,
    talkId: proposal.talkId,
    title: proposal.title,
    abstract: proposal.abstract,
    status: proposal.status,
    level: proposal.level,
    references: proposal.references,
    createdAt: proposal.createdAt.toISOString(),
    languages: jsonToArray(proposal.languages),
    formats: proposal.formats.map(({ name }) => name),
    categories: proposal.categories.map(({ name }) => name),
    speakers: proposal.speakers.map((speaker) => ({ id: speaker.id, name: speaker.name, photoURL: speaker.photoURL })),
  };
}

export class ProposalNotFoundError extends Error {
  constructor() {
    super('Proposal not found');
    this.name = 'ProposalNotFoundError';
  }
}
