import { type InviteType } from '@prisma/client';
import { config } from '../config';
import { db } from '../db';
import {
  InvitationNotFoundError,
  InvitationGenerateError,
  ProposalNotFoundError,
  TalkNotFoundError,
  OrganizationNotFoundError,
} from '../errors';

/**
 * Get invitation data from an invitation id
 * @param invitationId Id of the invitation
 * @returns Invitation data
 */
export const getInvitation = async (invitationId: string) => {
  const invitation = await db.invite.findUnique({
    select: { type: true, talk: true, proposal: true, organization: true, invitedBy: true },
    where: { id: invitationId },
  });
  if (!invitation) {
    throw new InvitationNotFoundError();
  }
  return {
    type: invitation.type,
    title: invitation.talk?.title || invitation.proposal?.title || invitation.organization?.name || '',
    invitedBy: invitation.invitedBy.name || '',
  };
};

/**
 * Generate an invitation link
 * @param type Type of the invitation
 * @param entityId Id of the entity to invite
 * @param uid Id of the user who is inviting
 * @returns Invitation link
 */
export async function generateInvitationLink(type: InviteType, entityId: string, uid: string) {
  let invitationKey: string | undefined;
  if (type === 'TALK') {
    invitationKey = await generateTalkInvitationKey(entityId, uid);
  } else if (type === 'PROPOSAL') {
    invitationKey = await generateProposalInvitationKey(entityId, uid);
  } else if (type === 'ORGANIZATION') {
    invitationKey = await generateOrganizationInvitationKey(entityId, uid);
  }

  if (!invitationKey) throw new InvitationGenerateError();
  return buildInvitationLink(invitationKey);
}

export function buildInvitationLink(invitationId?: string) {
  if (!invitationId) return;
  return `${config.appUrl}/invitation/${invitationId}`;
}

async function generateTalkInvitationKey(talkId: string, uid: string) {
  const talk = await db.talk.findFirst({
    select: { id: true, invitation: true },
    where: {
      speakers: { some: { id: uid } },
      id: talkId,
    },
  });
  if (!talk) throw new TalkNotFoundError();

  if (talk.invitation) return talk.invitation.id;

  const invite = await db.invite.create({
    data: {
      type: 'TALK',
      talk: { connect: { id: talkId } },
      invitedBy: { connect: { id: uid } },
    },
  });
  return invite.id;
}

async function generateProposalInvitationKey(proposalId: string, uid: string) {
  const proposal = await db.proposal.findFirst({
    select: { id: true, invitation: true },
    where: {
      speakers: { some: { id: uid } },
      id: proposalId,
    },
  });
  if (!proposal) throw new ProposalNotFoundError();

  if (proposal.invitation) return proposal.invitation.id;

  const invite = await db.invite.create({
    data: {
      type: 'PROPOSAL',
      proposal: { connect: { id: proposalId } },
      invitedBy: { connect: { id: uid } },
    },
  });
  return invite.id;
}

async function generateOrganizationInvitationKey(organizationId: string, uid: string) {
  const organization = await db.organization.findFirst({
    select: { id: true, invitation: true },
    where: {
      members: { some: { memberId: uid, role: 'OWNER' } },
      id: organizationId,
    },
  });

  if (!organization) throw new OrganizationNotFoundError();

  if (organization.invitation) return organization.invitation.id;

  const invite = await db.invite.create({
    data: {
      type: 'ORGANIZATION',
      organization: { connect: { id: organizationId } },
      invitedBy: { connect: { id: uid } },
    },
  });
  return invite.id;
}

/**
 * Revoke an invitation link
 * @param type Type of the invitation
 * @param entityId Id of the entity that should have the invite
 * @param uid Id of the user who is revoking
 */
export async function revokeInvitationLink(type: InviteType, entityId: string, uid: string) {
  if (type === 'TALK') {
    await db.invite.deleteMany({
      where: {
        type: 'TALK',
        talk: { id: entityId, speakers: { some: { id: uid } } },
      },
    });
  } else if (type === 'PROPOSAL') {
    await db.invite.deleteMany({
      where: {
        type: 'PROPOSAL',
        proposal: { id: entityId, speakers: { some: { id: uid } } },
      },
    });
  } else if (type === 'ORGANIZATION') {
    await db.invite.deleteMany({
      where: {
        type: 'ORGANIZATION',
        organization: { id: entityId, members: { some: { memberId: uid } } },
      },
    });
  }
}
