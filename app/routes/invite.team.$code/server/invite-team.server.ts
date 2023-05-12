import { db } from '~/libs/db';
import { InvitationInvalidOrAccepted, InvitationNotFoundError } from '~/libs/errors';

export async function checkTeamInviteCode(code: string) {
  const team = await db.team.findUnique({ where: { invitationCode: code } });

  if (!team) throw new InvitationNotFoundError();

  return { id: team.id, name: team.name, slug: team.slug };
}

export async function addMember(code: string, userId: string) {
  const team = await checkTeamInviteCode(code);

  try {
    await db.teamMember.create({ data: { memberId: userId, teamId: team.id } });
  } catch (e) {
    throw new InvitationInvalidOrAccepted();
  }

  return { slug: team.slug };
}
