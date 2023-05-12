import { TeamRole } from '@prisma/client';
import { allowedForTeam } from '~/shared-server/teams/check-user-role.server';
import type { EventCreateData } from '../types/event-create.schema';
import { db } from '~/libs/db';

export async function createEvent(teamSlug: string, userId: string, data: EventCreateData) {
  await allowedForTeam(teamSlug, userId, [TeamRole.OWNER]);

  return await db.$transaction(async (trx) => {
    const existSlug = await trx.event.findFirst({ where: { slug: data.slug } });
    if (existSlug) {
      return { error: { fieldErrors: { slug: 'This URL already exists, please try another one.' } } };
    }

    await trx.event.create({
      data: {
        ...data,
        creator: { connect: { id: userId } },
        team: { connect: { slug: teamSlug } },
      },
    });
    return { slug: data.slug };
  });
}
