import { db } from 'prisma/db.server.ts';
import type { Team, User } from 'prisma/generated/client.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import type { Mock } from 'vitest';
import { auth } from '~/shared/authentication/firebase.server.ts';
import { UserNotFoundError } from '~/shared/errors.server.ts';
import { AdminUsers } from './admin-users.server.ts';

vi.mock('~/shared/authentication/firebase.server.ts', () => ({ auth: { getUser: vi.fn(), deleteUser: vi.fn() } }));

describe('AdminUsers', () => {
  let admin: User;
  let user1: User;
  let user2: User;

  beforeEach(async () => {
    admin = await userFactory({ traits: ['clark-kent', 'admin'] });
    user1 = await userFactory({ traits: ['bruce-wayne'] });
    user2 = await userFactory({ traits: ['peter-parker'] });
  });

  describe('#listUsers', () => {
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

    beforeEach(async () => {
      team = await teamFactory({ owners: [user1] });
    });

    it('get user info', async () => {
      const getUser = auth.getUser as Mock;
      getUser.mockResolvedValue({
        emailVerified: true,
        metadata: { lastSignInTime: new Date('2024-02-02').toISOString() },
        providerData: [{ providerId: 'password', email: user1.email }],
      });

      const adminUsers = AdminUsers.for(admin);
      const user = await adminUsers.getUserInfo(user1.id);

      const teamMember = await db.teamMember.findFirst({ where: { memberId: user1.id, teamId: team.id } });
      expect(user).toEqual({
        uid: user1.uid,
        name: user1.name,
        email: user1.email,
        emailVerified: true,
        termsAccepted: user1.termsAccepted,
        lastSignInAt: new Date('2024-02-02'),
        updatedAt: user1.updatedAt,
        createdAt: user1.createdAt,
        deletedAt: null,
        talksCount: 0,
        authenticationMethods: [{ provider: 'password', email: user1.email }],
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

    it('get user info but not found in firebase auth', async () => {
      const getUser = auth.getUser as Mock;
      getUser.mockRejectedValue(new Error('User not found'));

      const adminUsers = AdminUsers.for(admin);
      const user = await adminUsers.getUserInfo(user1.id);

      const teamMember = await db.teamMember.findFirst({ where: { memberId: user1.id, teamId: team.id } });
      expect(user).toEqual({
        uid: user1.uid,
        name: user1.name,
        email: user1.email,
        emailVerified: false,
        termsAccepted: user1.termsAccepted,
        lastSignInAt: null,
        updatedAt: user1.updatedAt,
        createdAt: user1.createdAt,
        deletedAt: null,
        talksCount: 0,
        authenticationMethods: [],
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
    it('deletes user account', async () => {
      const deleteUserMock = auth.deleteUser as Mock;
      deleteUserMock.mockResolvedValue(undefined);

      const adminUsers = AdminUsers.for(admin);
      await adminUsers.deleteUser(user1.id);

      const deletedUser = await db.user.findUnique({ where: { id: user1.id } });
      expect(deletedUser?.deletedAt).toBeDefined();
    });

    it('throws an error when target user is not found', async () => {
      const adminUsers = AdminUsers.for(admin);

      await expect(adminUsers.deleteUser('xxx')).rejects.toThrowError(UserNotFoundError);
    });
  });
});
