import { db } from 'prisma/db.server.ts';
import { organizerKeyFactory } from 'tests/factories/organizer-key.ts';
import { userFactory } from 'tests/factories/users.ts';
import { InvalidAccessKeyError } from '~/shared/errors.server.ts';
import { TeamBetaAccess } from './team-beta-access.server.ts';

describe('TeamBetaAccess', () => {
  describe('hasAccess', () => {
    it('hasAccess if user has an organizer key', async () => {
      const user = { organizerKey: '123' };
      const hasAccess = TeamBetaAccess.hasAccess(user);
      expect(hasAccess).toBe(true);
    });

    it('hasAccess if user belongs to an team', async () => {
      const user = { organizerKey: '123' };
      const teamsCount = 2;
      const hasAccess = await TeamBetaAccess.hasAccess(user, teamsCount);
      expect(hasAccess).toBe(true);
    });

    it('is not allowed if user does not have organizer key or teams', async () => {
      const user = { organizerKey: null };
      const teamsCount = 0;
      const hasAccess = await TeamBetaAccess.hasAccess(user, teamsCount);
      expect(hasAccess).toBe(false);
    });

    it('is not allowed when user is not found', async () => {
      const user = null;
      const teamsCount = 2;
      const hasAccess = await TeamBetaAccess.hasAccess(user, teamsCount);
      expect(hasAccess).toBe(false);
    });
  });

  describe('validateAccessKey', () => {
    it('updates the user organizer key when key is valid', async () => {
      const user = await userFactory();
      const key = await organizerKeyFactory();
      await TeamBetaAccess.for(user.id).validateAccessKey(key.id);
      const updated = await db.user.findUnique({ where: { id: user.id } });
      expect(updated?.organizerKey).toBe(key.id);
    });

    it('return an error when key does not exist', async () => {
      const user = await userFactory();
      await expect(TeamBetaAccess.for(user.id).validateAccessKey('xxx')).rejects.toThrowError(InvalidAccessKeyError);
      const after = await db.user.findUnique({ where: { id: user.id } });
      expect(after?.organizerKey).toBeNull();
    });

    it('throw an error when key is revoked', async () => {
      const user = await userFactory();
      const key = await organizerKeyFactory({ attributes: { revokedAt: new Date() } });
      await expect(TeamBetaAccess.for(user.id).validateAccessKey(key.id)).rejects.toThrowError(InvalidAccessKeyError);
      const after = await db.user.findUnique({ where: { id: user.id } });
      expect(after?.organizerKey).toBeNull();
    });
  });
});
