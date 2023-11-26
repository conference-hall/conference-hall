import type { TeamRole } from '@prisma/client';
import { z } from 'zod';

import { db } from '~/libs/db';
import { ForbiddenOperationError, SlugAlreadyExistsError, TeamNotFoundError } from '~/libs/errors';
import { slugValidator } from '~/libs/validators/slug';

import { InvitationLink } from '../shared/InvitationLink';

export type Team = Awaited<ReturnType<typeof UserTeam.prototype.get>>;

export const TeamUpdateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  slug: slugValidator,
});

export class UserTeam {
  constructor(
    public userId: string,
    public slug: string,
  ) {}

  static for(userId: string, slug: string) {
    return new UserTeam(userId, slug);
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
      invitationLink: InvitationLink.build('team', team.invitationCode), // TODO: should not be able to invite if not owner?
    };
  }

  async updateSettings(data: z.infer<typeof TeamUpdateSchema>) {
    const member = await this.allowedFor(['OWNER']);

    return db.$transaction(async (trx) => {
      const existSlug = await trx.team.findFirst({ where: { slug: data.slug, id: { not: member.teamId } } });
      if (existSlug) throw new SlugAlreadyExistsError();

      return trx.team.update({ where: { id: member.teamId }, data });
    });
  }
}
