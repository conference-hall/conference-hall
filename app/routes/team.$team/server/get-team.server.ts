import { db } from '~/libs/db';
import { TeamNotFoundError } from '~/libs/errors';
import { buildInvitationLink } from '~/shared-server/invitations/build-link.server';

export type Team = Awaited<ReturnType<typeof getTeam>>;

export async function getTeam(slug: string, userId: string) {
  const orgaMember = await db.teamMember.findFirst({
    where: { memberId: userId, team: { slug } },
    orderBy: { team: { name: 'asc' } },
    include: { team: true },
  });

  if (!orgaMember) throw new TeamNotFoundError();

  return {
    id: orgaMember.team.id,
    name: orgaMember.team.name,
    slug: orgaMember.team.slug,
    role: orgaMember.role,
    invitationLink: buildInvitationLink('team', orgaMember.team.invitationCode),
  };
}
