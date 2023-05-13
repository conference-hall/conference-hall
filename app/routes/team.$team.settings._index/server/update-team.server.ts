import { allowedForTeam } from '~/shared-server/teams/check-user-role.server';
import type { TeamSaveData } from '../types/team-save.schema';
import { TeamRole } from '@prisma/client';
import { db } from '~/libs/db';

export async function updateTeam(slug: string, userId: string, data: TeamSaveData) {
  const team = await allowedForTeam(slug, userId, [TeamRole.OWNER]);

  return await db.$transaction(async (trx) => {
    const existSlug = await trx.team.findFirst({ where: { slug: data.slug } });
    if (existSlug && existSlug.id !== team?.id) {
      return { fieldErrors: { slug: 'This URL already exists, please try another one.' } };
    }

    await trx.team.update({ select: { id: true }, where: { slug }, data });
    return { slug: data.slug };
  });
}