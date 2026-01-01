import { userFactory } from 'tests/factories/users.ts';
import { NotFoundError } from '~/shared/errors.server.ts';
import { flags } from '~/shared/feature-flags/flags.server.ts';
import { AdminFlags } from './admin-flags.server.ts';

describe('AdminFlags', () => {
  describe('AdminFlags.for', () => {
    it('returns an instance for admin user', async () => {
      const admin = await userFactory({ traits: ['clark-kent', 'admin'] });

      const adminFlags = AdminFlags.for(admin);
      expect(adminFlags).toBeInstanceOf(AdminFlags);
    });
  });

  describe('#list', () => {
    it('lists all flags with their configurations', async () => {
      const admin = await userFactory({ traits: ['clark-kent', 'admin'] });

      const adminFlags = AdminFlags.for(admin);
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
      const admin = await userFactory({ traits: ['clark-kent', 'admin'] });

      const adminFlags = AdminFlags.for(admin);
      const flagKey = 'seo';
      const newValue = 'true';

      await adminFlags.update(flagKey, newValue);

      const updatedValue = await flags.get(flagKey);
      expect(updatedValue).toBe(true);
    });

    it('throws an error when updating a non-existent flag', async () => {
      const admin = await userFactory({ traits: ['clark-kent', 'admin'] });

      const adminFlags = AdminFlags.for(admin);
      const nonExistentFlagKey = 'nonExistentFlag';
      const newValue = 'true';

      await expect(adminFlags.update(nonExistentFlagKey, newValue)).rejects.toThrowError(NotFoundError);
    });
  });
});
