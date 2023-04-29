import { db } from '../../../libs/db';
import { buildInvitationLink } from '../../../shared-server/invitations/build-link.server';

/**
 * Returns invitation link of an organization
 * @param slug organization slug
 * @param userId Id of the user
 * @returns invitation link
 */
export async function getInvitationLink(slug: string, userId: string) {
  const invite = await db.invite.findFirst({
    where: { organization: { slug, members: { some: { memberId: userId } } } },
  });
  return buildInvitationLink(invite?.id);
}
