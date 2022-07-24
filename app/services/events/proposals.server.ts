import { z } from 'zod';
import { db } from '../../services/db';
import { getCfpState } from '../../utils/event';
import { getArray } from '../../utils/form';
import { jsonToArray } from '../../utils/prisma';
import {
  CfpNotOpenError,
  EventNotFoundError,
  InvitationNotFoundError,
  ProposalNotFoundError,
} from '../errors';
import { buildInvitationLink } from '../invitations/invitations.server';

export async function fetchSpeakerProposals(slug: string, uid: string) {
  const proposals = await db.proposal.findMany({
    select: {
      id: true,
      title: true,
      talkId: true,
      status: true,
      createdAt: true,
      speakers: true,
    },
    where: {
      speakers: { some: { id: uid } },
      event: { slug },
    },
    orderBy: { createdAt: 'desc' },
  });

  return proposals.map((proposal) => ({
    id: proposal.id,
    title: proposal.title,
    talkId: proposal.talkId,
    status: proposal.status,
    createdAt: proposal.createdAt.toISOString(),
    speakers: proposal.speakers.map((speaker) => ({
      id: speaker.id,
      name: speaker.name,
      photoURL: speaker.photoURL,
    })),
  }));
}

export async function isTalkAlreadySubmitted(
  slug: string,
  talkId: string,
  uid: string
) {
  const proposal = await db.proposal.findFirst({
    where: {
      talk: { id: talkId },
      event: { slug },
      status: { not: 'DRAFT' },
      speakers: { some: { id: uid } },
    },
  });
  return Boolean(proposal);
}

export async function getSpeakerProposal(proposalId: string, uid: string) {
  const proposal = await db.proposal.findFirst({
    where: {
      speakers: { some: { id: uid } },
      id: proposalId,
    },
    include: {
      speakers: true,
      formats: true,
      categories: true,
      talk: true,
      invitation: true,
    },
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
    formats: proposal.formats.map(({ id, name }) => ({ id, name })),
    categories: proposal.categories.map(({ id, name }) => ({ id, name })),
    invitationLink: buildInvitationLink(proposal.invitation?.id),
    speakers: proposal.speakers.map((speaker) => ({
      id: speaker.id,
      name: speaker.name,
      photoURL: speaker.photoURL,
      isOwner: speaker.id === proposal?.talk?.creatorId,
    })),
  };
}

export async function deleteProposal(proposalId: string, uid: string) {
  await db.proposal.deleteMany({
    where: { id: proposalId, speakers: { some: { id: uid } } },
  });
}

export async function updateProposal(
  slug: string,
  proposalId: string,
  uid: string,
  data: ProposalData
) {
  const event = await db.event.findUnique({
    select: { id: true, type: true, cfpStart: true, cfpEnd: true },
    where: { slug },
  });
  if (!event) throw new EventNotFoundError();

  const isCfpOpen =
    getCfpState(event.type, event.cfpStart, event.cfpEnd) === 'OPENED';
  if (!isCfpOpen) throw new CfpNotOpenError();

  const proposal = await db.proposal.findFirst({
    where: { id: proposalId, speakers: { some: { id: uid } } },
  });
  if (!proposal) throw new ProposalNotFoundError();

  const { formats, categories, ...talk } = data;

  await db.proposal.update({
    where: { id: proposalId },
    data: {
      ...talk,
      speakers: { set: [], connect: [{ id: uid }] },
      formats: { set: [], connect: formats.map((id) => ({ id })) },
      categories: { set: [], connect: categories.map((id) => ({ id })) },
    },
  });

  if (proposal.talkId) {
    await db.talk.update({
      where: { id: proposal.talkId },
      data: talk,
    });
  }
}

type ProposalData = z.infer<typeof ProposalSchema>;

const ProposalSchema = z.object({
  title: z.string().min(1),
  abstract: z.string().min(1),
  references: z.string().nullable(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable(),
  languages: z.array(z.string()),
  formats: z.array(z.string()),
  categories: z.array(z.string()),
});

export function validateProposalForm(form: FormData) {
  return ProposalSchema.safeParse({
    title: form.get('title'),
    abstract: form.get('abstract'),
    references: form.get('references'),
    level: form.get('level'),
    formats: form.getAll('formats'),
    categories: form.getAll('categories'),
    languages: getArray(form, 'languages'),
  });
}

/**
 * Invite a co-speaker to a proposal
 * @param invitationId Id of the invitation
 * @param coSpeakerId Id of the co-speaker to add
 */
export async function inviteCoSpeakerToProposal(
  invitationId: string,
  coSpeakerId: string
) {
  const invitation = await db.invite.findUnique({
    select: { type: true, proposal: true, organization: true, invitedBy: true },
    where: { id: invitationId },
  });
  if (!invitation || invitation.type !== 'PROPOSAL' || !invitation.proposal) {
    throw new InvitationNotFoundError();
  }

  const proposal = await db.proposal.update({
    select: { id: true, talkId: true, event: true },
    data: { speakers: { connect: { id: coSpeakerId } } },
    where: { id: invitation.proposal.id },
  });

  if (proposal.talkId) {
    await db.talk.update({
      data: { speakers: { connect: { id: coSpeakerId } } },
      where: { id: proposal.talkId },
    });
  }
  return { proposalId: proposal.id, eventSlug: proposal.event.slug };
}

/**
 * Remove a co-speaker from a proposal
 * @param uid Id of the connected user
 * @param talkId Id of the talk
 * @param eventSlug Slug of the event
 * @param coSpeakerId Id of the co-speaker to remove
 */
export async function removeCoSpeakerFromProposal(
  uid: string,
  talkId: string,
  eventSlug: string,
  coSpeakerId: string
) {
  const proposal = await db.proposal.findFirst({
    where: {
      talkId,
      event: { slug: eventSlug },
      speakers: { some: { id: uid } },
    },
  });
  if (!proposal) throw new ProposalNotFoundError();

  await db.proposal.update({
    where: { id: proposal.id },
    data: { speakers: { disconnect: { id: coSpeakerId } } },
  });
}
