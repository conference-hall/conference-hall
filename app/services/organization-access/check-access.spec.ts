import { disconnectDB, resetDB } from 'tests/db-helpers';
import { organizerKeyFactory } from 'tests/factories/organizer-key';
import { userFactory } from 'tests/factories/users';
import { db } from '../../libs/db';
import { checkAccess } from './check-access.server';

describe('#checkAccess', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('updates the user organizer key when key is valid', async () => {
    const key = await organizerKeyFactory();
    const user = await userFactory();
    await checkAccess(user.id, key.id);
    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.organizerKey).toBe(key.id);
  });

  it('return an error when key does not exist', async () => {
    const user = await userFactory();
    const errors = await checkAccess(user.id, 'unknown');
    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.organizerKey).toBeNull();
    expect(errors?.fieldErrors?.key).toEqual(['Invalid API key']);
  });

  it('return an error when key is revoked', async () => {
    const key = await organizerKeyFactory({ attributes: { revokedAt: new Date() } });
    const user = await userFactory();
    const errors = await checkAccess(user.id, key.id);
    expect(errors?.fieldErrors?.key).toEqual(['Invalid API key']);
  });
});
