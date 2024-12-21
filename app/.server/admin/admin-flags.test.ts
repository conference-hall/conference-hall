import type { User } from '@prisma/client/app/index.js';
import { userFactory } from 'tests/factories/users.ts';
import { NotAuthorizedError, NotFoundError } from '~/libs/errors.server.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { AdminFlags } from './admin-flags.ts';

describe('AdminFlags', () => {
  let admin: User;
  let user: User;

  beforeEach(async () => {
    admin = await userFactory({ traits: ['admin'] });
    user = await userFactory();
  });

  describe('AdminFlags.for', () => {
    it('throws an error when user is not admin', async () => {
      await expect(AdminFlags.for(user.id)).rejects.toThrowError(NotAuthorizedError);
    });

    it('returns an instance for admin user', async () => {
      const adminFlags = await AdminFlags.for(admin.id);
      expect(adminFlags).toBeInstanceOf(AdminFlags);
    });
  });

  describe('#list', () => {
    it('lists all flags with their configurations', async () => {
      const adminFlags = await AdminFlags.for(admin.id);
      const flagsList = await adminFlags.list();

      expect(flagsList).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: expect.any(String),
            description: expect.any(String),
            type: expect.any(String),
            tags: expect.arrayContaining([expect.any(String)]),
            value: expect.anything(),
          }),
        ]),
      );
    });
  });

  describe('#update', () => {
    it('updates a flag value', async () => {
      const adminFlags = await AdminFlags.for(admin.id);
      const flagKey = 'seo';
      const newValue = 'true';

      await adminFlags.update(flagKey, newValue);

      const updatedValue = await flags.get(flagKey);
      expect(updatedValue).toBe(true);
    });

    it('throws an error when updating a non-existent flag', async () => {
      const adminFlags = await AdminFlags.for(admin.id);
      const nonExistentFlagKey = 'nonExistentFlag';
      const newValue = 'true';

      await expect(adminFlags.update(nonExistentFlagKey, newValue)).rejects.toThrowError(NotFoundError);
    });
  });
});
