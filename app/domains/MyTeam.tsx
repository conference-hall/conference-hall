import type { TeamRole } from '@prisma/client';

import { db } from '~/libs/db';
import { ForbiddenOperationError, TeamNotFoundError } from '~/libs/errors';
import { buildInvitationLink } from '~/routes/__server/invitations/build-link.server';
import { getCfpState } from '~/utils/event';

export type Team = Awaited<ReturnType<typeof MyTeam.prototype.get>>;

export class MyTeam {
  constructor(
    public userId: string,
    public slug: string,
  ) {}

  static for(userId: string, slug: string) {
    return new MyTeam(userId, slug);
  }

  async allowedFor(roles: TeamRole[]) {
    const member = await db.teamMember.findFirst({
      where: { memberId: this.userId, role: { in: roles }, team: { slug: this.slug } },
    });
    if (!member) throw new ForbiddenOperationError();
    return member;
  }

  async get() {
    const member = await this.allowedFor(['MEMBER', 'REVIEWER', 'OWNER']);

    const team = await db.team.findUnique({ where: { slug: this.slug } });
    if (!team) throw new TeamNotFoundError();

    return {
      id: team.id,
      name: team.name,
      slug: team.slug,
      role: member.role,
      invitationLink: buildInvitationLink('team', team.invitationCode), // TODO: should not be able to invite if not owner?
    };
  }

  async listEvents(archived: boolean) {
    await this.allowedFor(['MEMBER', 'REVIEWER', 'OWNER']);

    const events = await db.event.findMany({
      where: { team: { slug: this.slug }, archived },
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
}
