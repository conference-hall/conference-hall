import { getCfpState } from '~/utils/event';
import { db } from '../db';
import { EventNotFoundError } from '../errors';

/**
 * Get event for user
 * @param slug event slug
 * @param uid Id of the user
 * @returns event
 */
export async function getEvent(slug: string, uid: string) {
  const event = await db.event.findFirst({
    where: { slug, organization: { members: { some: { memberId: uid } } } },
  });
  if (!event) throw new EventNotFoundError();
  return {
    name: event.name,
    slug: event.slug,
    type: event.type,
    visibility: event.visibility,
    cfpStart: event.cfpStart?.toUTCString(),
    cfpEnd: event.cfpEnd?.toUTCString(),
    cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
  };
}
