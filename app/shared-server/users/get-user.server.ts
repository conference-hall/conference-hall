import { db } from '~/libs/db';
import type { UserSocialLinks } from '~/schemas/user';
import { sortBy } from '~/utils/arrays';

export type User = Awaited<ReturnType<typeof getUser>>;

export async function getUser(userId: string | null) {
  if (userId === null) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { organizations: { include: { organization: true } } },
  });

  if (!user) return null;

  const notifications = await listNotifications(user.id);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    bio: user.bio,
    references: user.references,
    company: user.company,
    address: user.address,
    socials: user.socials as UserSocialLinks,
    organizations: sortBy(
      user.organizations.map((member) => ({
        slug: member.organization.slug,
        name: member.organization.name,
        role: member.role,
      })),
      'name'
    ),
    notifications,
    isOrganizer: Boolean(user.organizerKey || user.organizations.length > 0),
  };
}

async function listNotifications(userId: string) {
  if (userId === null) return [];

  const acceptedProposals = await db.proposal.findMany({
    include: { event: true },
    where: {
      status: 'ACCEPTED',
      emailAcceptedStatus: { not: null },
      speakers: { some: { id: userId } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return acceptedProposals.map((proposal) => ({
    type: 'ACCEPTED_PROPOSAL',
    proposal: {
      id: proposal.id,
      title: proposal.title,
    },
    event: {
      slug: proposal.event.slug,
      name: proposal.event.name,
    },
    date: proposal.updatedAt.toUTCString(),
  }));
}
