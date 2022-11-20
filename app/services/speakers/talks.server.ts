import { ProposalStatus } from '@prisma/client';
import type { TalkSaveData } from '~/schemas/talks';
import { db } from '../../services/db';
import { jsonToArray } from '../../utils/prisma';
import { InvitationNotFoundError, TalkNotFoundError } from '../errors';
import { buildInvitationLink } from '../invitations/build-link.server';

type TalksListOptions = { archived?: boolean };

/**
 * List all talks for a speaker
 * @param uid Id of the connected user
 * @returns speaker talks
 */
export async function findTalks(uid: string, options?: TalksListOptions) {
  const talks = await db.talk.findMany({
    select: {
      id: true,
      title: true,
      archived: true,
      createdAt: true,
      speakers: true,
    },
    where: {
      speakers: { some: { id: uid } },
      archived: options?.archived ?? false,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return talks.map((talk) => ({
    id: talk.id,
    title: talk.title,
    archived: talk.archived,
    createdAt: talk.createdAt.toUTCString(),
    speakers: talk.speakers.map((speaker) => ({
      id: speaker.id,
      name: speaker.name,
      photoURL: speaker.photoURL,
    })),
  }));
}

/**
 * Get a talk for a speaker
 * @param uid Id of the connected user
 * @param talkId Id of the talk
 * @returns Speaker talk
 */
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
    proposals: talk.proposals.map((proposal) => ({
      eventSlug: proposal.event.slug,
      eventName: proposal.event.name,
      status: proposal.status,
      date: proposal.updatedAt.toUTCString(),
    })),
    invitationLink: buildInvitationLink(talk.invitation?.id),
  };
}

/**
 * Delete a talk for a speaker
 * @param uid Id of the connected user
 * @param talkId Id of the talk
 */
export async function deleteTalk(uid: string, talkId: string) {
  const talk = await db.talk.findFirst({
    where: { id: talkId, speakers: { some: { id: uid } } },
  });
  if (!talk) throw new TalkNotFoundError();

  await db.$transaction([
    db.proposal.deleteMany({ where: { talkId, status: ProposalStatus.DRAFT } }),
    db.talk.delete({ where: { id: talkId } }),
  ]);
}

/**
 * Create a new talk for a speaker
 * @param uid Id of the connected user
 * @param data Talk data
 */
export async function createTalk(uid: string, data: TalkSaveData) {
  const result = await db.talk.create({
    data: {
      ...data,
      creator: { connect: { id: uid } },
      speakers: { connect: [{ id: uid }] },
    },
  });
  return result.id;
}

/**
 * Update a talk for a speaker
 * @param uid Id of the connected user
 * @param talkId Id of the talk
 * @param data Talk data
 */
export async function updateTalk(uid: string, talkId?: string, data?: TalkSaveData) {
  const talk = await db.talk.findFirst({
    where: { id: talkId, speakers: { some: { id: uid } } },
  });
  if (!talk || !data) throw new TalkNotFoundError();

  await db.talk.update({
    where: { id: talkId },
    data,
  });
}

/**
 * Invite a co-speaker to a talk
 * @param invitationId Id of the invitation
 * @param coSpeakerId Id of the co-speaker to add
 */
export async function inviteCoSpeakerToTalk(invitationId: string, coSpeakerId: string) {
  const invitation = await db.invite.findUnique({
    select: { type: true, talk: true, organization: true, invitedBy: true },
    where: { id: invitationId },
  });
  if (!invitation || invitation.type !== 'TALK' || !invitation.talk) {
    throw new InvitationNotFoundError();
  }

  const talk = await db.talk.update({
    data: { speakers: { connect: { id: coSpeakerId } } },
    where: { id: invitation.talk.id },
  });
  return { id: talk.id };
}

/**
 * Remove a co-speaker from a talk
 * @param uid Id of the connected user
 * @param talkId Id of the talk
 * @param coSpeakerId Id of the co-speaker to remove
 */
export async function removeCoSpeakerFromTalk(uid: string, talkId: string, coSpeakerId: string) {
  const talk = await db.talk.findFirst({
    where: { id: talkId, speakers: { some: { id: uid } } },
  });
  if (!talk) throw new TalkNotFoundError();

  await db.talk.update({
    where: { id: talkId },
    data: { speakers: { disconnect: { id: coSpeakerId } } },
  });
}

/**
 * Archive a talk
 * @param uid Id of the connected user
 * @param talkId Id of the talk
 */
export async function archiveTalk(uid: string, talkId: string) {
  const talk = await db.talk.findFirst({
    where: { id: talkId, speakers: { some: { id: uid } } },
  });
  if (!talk) throw new TalkNotFoundError();

  await db.talk.update({ where: { id: talkId }, data: { archived: true } });
}

/**
 * Restore an archived talk
 * @param uid Id of the connected user
 * @param talkId Id of the talk
 */
export async function restoreTalk(uid: string, talkId: string) {
  const talk = await db.talk.findFirst({
    where: { id: talkId, speakers: { some: { id: uid } } },
  });
  if (!talk) throw new TalkNotFoundError();

  await db.talk.update({ where: { id: talkId }, data: { archived: false } });
}
