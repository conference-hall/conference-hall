import type { Team, User } from 'prisma/generated/client.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { NotAuthorizedError } from '~/shared/errors.server.ts';
import { AdminTeams } from './admin-teams.server.ts';

describe('AdminTeams', () => {
  let admin: User;
  let user1: User;
  let user2: User;
  let team1: Team;
  let team2: Team;

  beforeEach(async () => {
    admin = await userFactory({ traits: ['clark-kent', 'admin'] });
    user1 = await userFactory({ traits: ['bruce-wayne'] });
    user2 = await userFactory({ traits: ['peter-parker'] });
    team1 = await teamFactory({ attributes: { name: 'Team 1' }, owners: [user1] });
    team2 = await teamFactory({ attributes: { name: 'Team 2' }, owners: [user1, user2] });
    await eventFactory({ team: team2 });
  });

  describe('AdminTeams.for', () => {
    it('throws an error when user is not admin', async () => {
      await expect(AdminTeams.for(user1.id)).rejects.toThrowError(NotAuthorizedError);
    });
  });

  describe('#listTeams', () => {
    it('lists all teams', async () => {
      const adminTeams = await AdminTeams.for(admin.id);
      const teams = await adminTeams.listTeams({}, 1);

      expect(teams.filters).toEqual({});
      expect(teams.pagination).toEqual({ current: 1, pages: 1 });
      expect(teams.statistics).toEqual({ total: 2 });

      expect(teams.results.length).toBe(2);
      expect(teams.results.map((user) => user.id)).toEqual([team2.id, team1.id]);

      expect(teams.results[0]).toEqual({
        id: team2.id,
        slug: team2.slug,
        name: team2.name,
        createdAt: team2.createdAt,
        events: { count: 1 },
        members: { count: 2 },
      });
    });

    it('filters teams by name', async () => {
      const adminTeams = await AdminTeams.for(admin.id);
      const teams = await adminTeams.listTeams({ query: 'team 1' }, 1);

      expect(teams.filters).toEqual({ query: 'team 1' });
      expect(teams.pagination).toEqual({ current: 1, pages: 1 });
      expect(teams.statistics).toEqual({ total: 1 });

      expect(teams.results.length).toBe(1);
      expect(teams.results[0].name).toEqual('Team 1');
    });

    it('sort by members', async () => {
      const adminTeams = await AdminTeams.for(admin.id);
      const teams = await adminTeams.listTeams({ sort: 'members', order: 'asc' }, 1);

      expect(teams.results.length).toBe(2);
      expect(teams.results.map((user) => user.id)).toEqual([team1.id, team2.id]);
    });

    it('sort by events', async () => {
      const adminTeams = await AdminTeams.for(admin.id);
      const teams = await adminTeams.listTeams({ sort: 'events', order: 'asc' }, 1);

      expect(teams.results.length).toBe(2);
      expect(teams.results.map((user) => user.id)).toEqual([team1.id, team2.id]);
    });

    it('paginates results', async () => {
      const adminTeams = await AdminTeams.for(admin.id);
      const teams = await adminTeams.listTeams({}, 1, 1);

      expect(teams.pagination).toEqual({ current: 1, pages: 2 });
      expect(teams.statistics).toEqual({ total: 2 });
    });
  });
});
