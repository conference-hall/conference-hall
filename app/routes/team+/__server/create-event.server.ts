import { TeamRole } from '@prisma/client';

import { db } from '~/libs/db.ts';
import { allowedForTeam } from '~/routes/__server/teams/check-user-role.server.ts';

import type { EventCreateData } from '../__types/event-create.schema.ts';

export async function createEvent(teamSlug: string, userId: string, data: EventCreateData) {
  await allowedForTeam(teamSlug, userId, [TeamRole.OWNER]);

  return await db.$transaction(async (trx) => {
    const existSlug = await trx.event.findFirst({ where: { slug: data.slug } });
    if (existSlug) {
      return { error: { slug: ['This URL already exists, please try another one.'] } };
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
