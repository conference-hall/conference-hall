import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { UserNotFoundError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';
import type { Team, User } from '../../../../../prisma/generated/client.ts';
import { AdminUsers } from './admin-users.server.ts';

describe('AdminUsers', () => {
  let admin: User;

  beforeEach(async () => {
    admin = await userFactory({ traits: ['clark-kent', 'admin'] });
  });

  describe('#listUsers', () => {
    let user1: User;
    let user2: User;

    beforeEach(async () => {
      user1 = await userFactory({ traits: ['bruce-wayne'], withPasswordAccount: true });
      user2 = await userFactory({ traits: ['peter-parker'], withPasswordAccount: true });
    });

    it('lists all users', async () => {
      const adminUsers = AdminUsers.for(admin);
      const users = await adminUsers.listUsers({}, 1);

      expect(users.filters).toEqual({});
      expect(users.pagination).toEqual({ current: 1, pages: 1 });
      expect(users.statistics).toEqual({ total: 3 });

      expect(users.results.length).toBe(3);
      expect(users.results.map((user) => user.id)).toEqual(expect.arrayContaining([user2.id, user1.id, admin.id]));

      const userResult = users.results.find((user) => user.id === user2.id);
      expect(userResult).toEqual({
        id: user2.id,
        name: user2.name,
        email: user2.email,
        createdAt: user2.createdAt,
      });
    });

    it('filters users by name', async () => {
      const adminUsers = AdminUsers.for(admin);
      const users = await adminUsers.listUsers({ query: 'bruce way' }, 1);

      expect(users.filters).toEqual({ query: 'bruce way' });
      expect(users.pagination).toEqual({ current: 1, pages: 1 });
      expect(users.statistics).toEqual({ total: 1 });

      expect(users.results.length).toBe(1);
      expect(users.results[0].name).toEqual('Bruce Wayne');
    });

    it('filters users by email', async () => {
      const adminUsers = AdminUsers.for(admin);
      const users = await adminUsers.listUsers({ query: 'batman@example.com' }, 1);

      expect(users.filters).toEqual({ query: 'batman@example.com' });
      expect(users.pagination).toEqual({ current: 1, pages: 1 });
      expect(users.statistics).toEqual({ total: 1 });

      expect(users.results.length).toBe(1);
      expect(users.results[0].name).toEqual('Bruce Wayne');
    });

    it('paginates results', async () => {
      const adminUsers = AdminUsers.for(admin);
      const users = await adminUsers.listUsers({}, 1, 1);

      expect(users.pagination).toEqual({ current: 1, pages: 3 });
      expect(users.statistics).toEqual({ total: 3 });
    });
  });

  describe('#getUserInfo', () => {
    let team: Team;
    let user: User;

    beforeEach(async () => {
      user = await userFactory({ withPasswordAccount: true, withAuthSession: true });
      team = await teamFactory({ owners: [user] });
    });

    it('get user info', async () => {
      const adminUsers = AdminUsers.for(admin);
      const userInfo = await adminUsers.getUserInfo(user.id);

      const teamMember = await db.teamMember.findFirst({ where: { memberId: user.id, teamId: team.id } });
      expect(userInfo).toEqual({
        uid: user.uid,
        name: user.name,
        email: user.email,
        emailVerified: true,
        termsAccepted: user.termsAccepted,
        lastSignInAt: expect.any(Date),
        updatedAt: user.updatedAt,
        createdAt: user.createdAt,
        deletedAt: null,
        talksCount: 0,
        accounts: [
          {
            providerId: 'credential',
            accountId: expect.any(String),
            createdAt: expect.any(Date),
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
      const adminUsers = AdminUsers.for(admin);

      await expect(adminUsers.getUserInfo('xxx')).rejects.toThrowError(UserNotFoundError);
    });
  });

  describe('#deleteUser', () => {
    let user: User;

    beforeEach(async () => {
      user = await userFactory({ withPasswordAccount: true });
    });

    it('deletes user account', async () => {
      const adminUsers = AdminUsers.for(admin);
      await adminUsers.deleteUser(user.id);

      const deletedUser = await db.user.findUnique({ where: { id: user.id } });
      expect(deletedUser?.deletedAt).toBeDefined();
    });

    it('throws an error when target user is not found', async () => {
      const adminUsers = AdminUsers.for(admin);

      await expect(adminUsers.deleteUser('xxx')).rejects.toThrowError(UserNotFoundError);
    });
  });
});
