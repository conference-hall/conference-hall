import { db } from '../db';

export async function listOrganizations(uid: string) {
  const organizations = await db.organizationMember.findMany({
    select: {
      role: true,
      organization: { include: { _count: { select: { members: true, events: { where: { archived: false } } } } } },
    },
    where: { memberId: uid },
    orderBy: { organization: { name: 'asc' } },
  });

  return organizations.map((member) => ({
    name: member.organization.name,
    slug: member.organization.slug,
    role: member.role,
    membersCount: member.organization._count.members,
    eventsCount: member.organization._count.events,
  }));
}
