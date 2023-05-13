import { TeamRole } from '@prisma/client';
import { db } from '~/libs/db';
import { z } from 'zod';
import { text } from '~/schemas/utils';
import { slugValidator } from '~/schemas/validators';

export const TeamSaveSchema = z.object({
  name: text(z.string().trim().min(3).max(50)),
  slug: text(slugValidator).refine(checkSlugAlreadyExist, {
    message: 'This URL already exists, please try another one.',
  }),
});

type TeamSaveData = z.infer<typeof TeamSaveSchema>;

export async function createTeam(userId: string, data: TeamSaveData) {
  return await db.$transaction(async (trx) => {
    const updated = await trx.team.create({ select: { id: true }, data });
    await trx.teamMember.create({
      data: { memberId: userId, teamId: updated.id, role: TeamRole.OWNER },
    });
    return { slug: data.slug };
  });
}

async function checkSlugAlreadyExist(slug: string) {
  const count = await db.team.count({ where: { slug } });
  return count === 0;
}
