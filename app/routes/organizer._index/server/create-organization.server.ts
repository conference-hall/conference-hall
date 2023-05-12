import { TeamRole } from '@prisma/client';
import { db } from '~/libs/db';
import type { TeamSaveData } from '../types/organization-save.schema';

export async function createOrganization(userId: string, data: TeamSaveData) {
  return await db.$transaction(async (trx) => {
    const existSlug = await trx.team.findFirst({ where: { slug: data.slug } });
    if (existSlug) return { fieldErrors: { slug: 'This URL already exists, please try another one.' } };

    const updated = await trx.team.create({ select: { id: true }, data });
    await trx.teamMember.create({
      data: { memberId: userId, teamId: updated.id, role: TeamRole.OWNER },
    });
    return { slug: data.slug };
  });
}
