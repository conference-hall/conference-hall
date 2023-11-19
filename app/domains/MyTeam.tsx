import type { TeamRole } from '@prisma/client';
import { z } from 'zod';

import { db } from '~/libs/db';
import { ForbiddenOperationError, SlugAlreadyExistsError, TeamNotFoundError } from '~/libs/errors';
import { buildInvitationLink } from '~/routes/__server/invitations/build-link.server';
import { slugValidator } from '~/routes/__types/validators';

export type Team = Awaited<ReturnType<typeof MyTeam.prototype.get>>;

export const TeamUpdateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  slug: slugValidator,
});

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

  async updateSettings(data: z.infer<typeof TeamUpdateSchema>) {
    const member = await this.allowedFor(['OWNER']);

    return await db.$transaction(async (trx) => {
      const existSlug = await trx.team.findFirst({ where: { slug: data.slug, id: { not: member.teamId } } });
      if (existSlug) throw new SlugAlreadyExistsError();

      return trx.team.update({ where: { slug: this.slug }, data });
    });
  }
}
