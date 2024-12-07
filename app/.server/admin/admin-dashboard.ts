import type { EventType } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { needsAdminRole } from './authorization.ts';

export class AdminDashboard {
  private constructor() {}

  static async for(userId: string) {
    await needsAdminRole(userId);
    return new AdminDashboard();
  }

  async usersMetrics() {
    const total = await db.user.count();
    const speakers = await db.user.count({ where: { proposals: { some: {} } } });
    const organizers = await db.teamMember.count();

    return { total, speakers, organizers };
  }

  async eventsMetrics(type: EventType) {
    const results = await db.event.groupBy({ by: ['visibility'], _count: { _all: true }, where: { type } });

    const cfpOpen =
      type === 'CONFERENCE'
        ? await db.event.count({ where: { type, cfpStart: { lte: new Date() }, cfpEnd: { gte: new Date() } } })
        : await db.event.count({ where: { type, cfpStart: { not: null } } });

    return {
      total: sum(results),
      public: sum(results.filter((p) => p.visibility === 'PUBLIC')),
      private: sum(results.filter((p) => p.visibility === 'PRIVATE')),
      cfpOpen,
    };
  }

  async teamsMetrics() {
    const total = await db.team.count();
    const members = await db.teamMember.groupBy({ by: ['role'], _count: { _all: true } });

    return {
      total,
      organizers: sum(members),
      owners: sum(members.filter((m) => m.role === 'OWNER')),
      members: sum(members.filter((m) => m.role === 'MEMBER')),
      reviewers: sum(members.filter((m) => m.role === 'REVIEWER')),
    };
  }

  async proposalsMetrics() {
    const results = await db.proposal.groupBy({ by: ['isDraft'], _count: { _all: true } });

    return {
      total: sum(results),
      draft: sum(results.filter((p) => p.isDraft)),
      submitted: sum(results.filter((p) => !p.isDraft)),
    };
  }
}

function sum(group: { _count: { _all: number } }[]) {
  return group.map(({ _count }) => _count._all).reduce((a, b) => a + b, 0);
}
