import { db } from '~/libs/db.ts';
import { TeamNotFoundError } from '~/libs/errors.ts';
import { buildInvitationLink } from '~/routes/__server/invitations/build-link.server.ts';

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
