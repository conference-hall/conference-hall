import { type InviteType } from '@prisma/client';
import { db } from '../../../libs/db';
import {
  InvitationGenerateError,
  ProposalNotFoundError,
  TalkNotFoundError,
  OrganizationNotFoundError,
} from '../../../libs/errors';
import { buildInvitationLink } from '~/shared-server/invitations/build-link.server';

export async function generateLink(type: InviteType, entityId: string, userId: string) {
  let invitationKey: string | undefined;
  if (type === 'TALK') {
    invitationKey = await generateTalkInvitationKey(entityId, userId);
  } else if (type === 'PROPOSAL') {
    invitationKey = await generateProposalInvitationKey(entityId, userId);
  } else if (type === 'ORGANIZATION') {
    invitationKey = await generateOrganizationInvitationKey(entityId, userId);
  }

  if (!invitationKey) throw new InvitationGenerateError();
  return buildInvitationLink(invitationKey);
}

async function generateTalkInvitationKey(talkId: string, userId: string) {
  const talk = await db.talk.findFirst({
    select: { id: true, invitation: true },
    where: {
      speakers: { some: { id: userId } },
      id: talkId,
    },
  });
  if (!talk) throw new TalkNotFoundError();

  if (talk.invitation) return talk.invitation.id;

  const invite = await db.invite.create({
    data: {
      type: 'TALK',
      talk: { connect: { id: talkId } },
      invitedBy: { connect: { id: userId } },
    },
  });
  return invite.id;
}

async function generateProposalInvitationKey(proposalId: string, userId: string) {
  const proposal = await db.proposal.findFirst({
    select: { id: true, invitation: true },
    where: {
      speakers: { some: { id: userId } },
      id: proposalId,
    },
  });
  if (!proposal) throw new ProposalNotFoundError();

  if (proposal.invitation) return proposal.invitation.id;

  const invite = await db.invite.create({
    data: {
      type: 'PROPOSAL',
      proposal: { connect: { id: proposalId } },
      invitedBy: { connect: { id: userId } },
    },
  });
  return invite.id;
}

async function generateOrganizationInvitationKey(organizationId: string, userId: string) {
  const organization = await db.organization.findFirst({
    select: { id: true, invitation: true },
    where: {
      members: { some: { memberId: userId, role: 'OWNER' } },
      id: organizationId,
    },
  });

  if (!organization) throw new OrganizationNotFoundError();

  if (organization.invitation) return organization.invitation.id;

  const invite = await db.invite.create({
    data: {
      type: 'ORGANIZATION',
      organization: { connect: { id: organizationId } },
      invitedBy: { connect: { id: userId } },
    },
  });
  return invite.id;
}
