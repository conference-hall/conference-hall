import { organizerKeyFactory } from 'tests/factories/organizer-key';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db';
import { ForbiddenOperationError, InvalidAccessKeyError } from '~/libs/errors';

import { TeamBetaAccess } from './TeamBetaAccess';

describe('TeamBetaAccess', () => {
  describe('check', () => {
    it('does not throw error if users has an access key', async () => {
      const user = await userFactory({ isOrganizer: true });
      await expect(TeamBetaAccess.for(user.id).check()).resolves.not.toThrowError();
    });

    it('does not throw error if user is already member of a team', async () => {
      const user = await userFactory();
      await teamFactory({ members: [user] });
      await expect(TeamBetaAccess.for(user.id).check()).resolves.not.toThrowError();
    });

    it('throws an error if user does not have an access key', async () => {
      const user = await userFactory();
      await expect(TeamBetaAccess.for(user.id).check()).rejects.toThrowError(ForbiddenOperationError);
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
