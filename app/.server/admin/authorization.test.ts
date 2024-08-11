import { userFactory } from 'tests/factories/users.ts';
import { NotAuthorizedError } from '~/libs/errors.server.ts';
import { needsAdminRole } from './authorization.ts';

describe('#needsAdminRole', () => {
  it('allows admin', async () => {
    const user = await userFactory({ attributes: { admin: true } });
    await expect(needsAdminRole(user.id)).resolves.not.toThrow();
  });

  it('throws an error when user is not found', async () => {
    await expect(needsAdminRole('123')).rejects.toThrowError(NotAuthorizedError);
  });

  it('throws an error when user is not admin', async () => {
    const user = await userFactory();
    await expect(needsAdminRole(user.id)).rejects.toThrowError(NotAuthorizedError);
  });
});
