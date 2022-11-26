import { db } from '../db';
import { buildInvitationLink } from '../invitations/build-link.server';

/**
 * Returns invitation link of an organization
 * @param slug organization slug
 * @param uid Id of the user
 * @returns invitation link
 */
export async function getInvitationLink(slug: string, uid: string) {
  const invite = await db.invite.findFirst({
    where: { organization: { slug, members: { some: { memberId: uid } } } },
  });
  return buildInvitationLink(invite?.id);
}
