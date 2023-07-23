import { db } from '~/libs/db';
import { allowedForTeam } from '~/server/teams/check-user-role.server';
import { getCfpState } from '~/utils/event';

export async function listEvents(slug: string, userId: string, archived: boolean) {
  await allowedForTeam(slug, userId);

  const events = await db.event.findMany({
    where: { team: { slug }, archived },
    orderBy: { name: 'asc' },
  });

  return events.map((event) => ({
    slug: event.slug,
    name: event.name,
    type: event.type,
    logo: event.logo,
    cfpStart: event.cfpStart?.toUTCString(),
    cfpEnd: event.cfpEnd?.toUTCString(),
    cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
  }));
}