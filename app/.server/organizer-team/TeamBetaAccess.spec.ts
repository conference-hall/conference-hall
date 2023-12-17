import { organizerKeyFactory } from 'tests/factories/organizer-key';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.server';
import { InvalidAccessKeyError } from '~/libs/errors.server';

import { TeamBetaAccess } from './TeamBetaAccess';

describe('TeamBetaAccess', () => {
  describe('isAllowed', () => {
    it('is allowed if user has an organizer key', async () => {
      const user = await userFactory({ isOrganizer: true });
      const isAllowed = await TeamBetaAccess.for(user.id).isAllowed();
      expect(isAllowed).toBe(true);
    });

    it('is allowed if user belongs to an team', async () => {
      const user = await userFactory();
      await teamFactory({ members: [user] });
      const isAllowed = await TeamBetaAccess.for(user.id).isAllowed();
      expect(isAllowed).toBe(true);
    });

    it('is not allowed if user does not have organizer key or teams', async () => {
      const user = await userFactory();
      const isAllowed = await TeamBetaAccess.for(user.id).isAllowed();
      expect(isAllowed).toBe(false);
    });

    it('is not allowed when user is not found', async () => {
      const isAllowed = await TeamBetaAccess.for('XXX').isAllowed();
      expect(isAllowed).toBe(false);
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
