import type { Team, User } from '@prisma/client/app/index.js';
import { db } from 'prisma/db.server.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { NotAuthorizedError, UserNotFoundError } from '~/libs/errors.server.ts';
import { AdminUsers } from './admin-users.ts';

describe('AdminUsers', () => {
  let admin: User;
  let user1: User;
  let user2: User;

  beforeEach(async () => {
    admin = await userFactory({ traits: ['clark-kent', 'admin'] });
    user1 = await userFactory({ traits: ['bruce-wayne'] });
    user2 = await userFactory({ traits: ['peter-parker'] });
  });

  describe('AdminUsers.for', () => {
    it('throws an error when user is not admin', async () => {
      await expect(AdminUsers.for(user1.id)).rejects.toThrowError(NotAuthorizedError);
    });
  });

  describe('#listUsers', () => {
    it('lists all users', async () => {
      const adminUsers = await AdminUsers.for(admin.id);
      const users = await adminUsers.listUsers({}, 1);

      expect(users.filters).toEqual({});
      expect(users.pagination).toEqual({ current: 1, pages: 1 });
      expect(users.statistics).toEqual({ total: 3 });

      expect(users.results.length).toBe(3);
      expect(users.results.map((user) => user.id)).toEqual([user2.id, user1.id, admin.id]);

      expect(users.results[0]).toEqual({
        id: user2.id,
        name: user2.name,
        email: user2.email,
        createdAt: user2.createdAt,
      });
    });

    it('filters users by name', async () => {
      const adminUsers = await AdminUsers.for(admin.id);
      const users = await adminUsers.listUsers({ query: 'bruce way' }, 1);

      expect(users.filters).toEqual({ query: 'bruce way' });
      expect(users.pagination).toEqual({ current: 1, pages: 1 });
      expect(users.statistics).toEqual({ total: 1 });

      expect(users.results.length).toBe(1);
      expect(users.results[0].name).toEqual('Bruce Wayne');
    });

    it('filters users by email', async () => {
      const adminUsers = await AdminUsers.for(admin.id);
      const users = await adminUsers.listUsers({ query: 'batman@example.com' }, 1);

      expect(users.filters).toEqual({ query: 'batman@example.com' });
      expect(users.pagination).toEqual({ current: 1, pages: 1 });
      expect(users.statistics).toEqual({ total: 1 });

      expect(users.results.length).toBe(1);
      expect(users.results[0].name).toEqual('Bruce Wayne');
    });

    it('paginates results', async () => {
      const adminUsers = await AdminUsers.for(admin.id);
      const users = await adminUsers.listUsers({}, 1, 1);

      expect(users.pagination).toEqual({ current: 1, pages: 3 });
      expect(users.statistics).toEqual({ total: 3 });
    });
  });

  describe('#getUserInfo', () => {
    let team: Team;

    beforeEach(async () => {
      team = await teamFactory({ owners: [user1] });
    });

    it('get user info', async () => {
      const adminUsers = await AdminUsers.for(admin.id);
      const user = await adminUsers.getUserInfo(user1.id);

      const authMethod = await db.authenticationMethod.findFirst({ where: { userId: user1.id } });
      const teamMember = await db.teamMember.findFirst({ where: { memberId: user1.id, teamId: team.id } });

      expect(user).toEqual({
        name: user1.name,
        email: user1.email,
        emailVerified: user1.emailVerified,
        termsAccepted: user1.termsAccepted,
        updatedAt: user1.updatedAt,
        createdAt: user1.createdAt,
        authenticationMethods: [
          {
            provider: authMethod?.provider,
            email: authMethod?.email,
            uid: authMethod?.uid,
            createdAt: authMethod?.createdAt,
          },
        ],
        teams: [
          {
            slug: team.slug,
            name: team.name,
            role: teamMember?.role,
            createdAt: teamMember?.createdAt,
          },
        ],
      });
    });

    it('throws an error when user is not found', async () => {
      const adminUsers = await AdminUsers.for(admin.id);

      await expect(adminUsers.getUserInfo('xxx')).rejects.toThrowError(UserNotFoundError);
    });
  });
});
