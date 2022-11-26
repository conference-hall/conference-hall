import { db } from '../../libs/db';
import { getUserRole } from './get-user-role.server';

export async function listEvents(slug: string, uid: string) {
  const role = await getUserRole(slug, uid);
  if (!role) return [];

  const events = await db.event.findMany({
    where: { organization: { slug } },
    orderBy: { name: 'asc' },
  });
  return events.map((event) => ({
    slug: event.slug,
    name: event.name,
    type: event.type,
  }));
}
