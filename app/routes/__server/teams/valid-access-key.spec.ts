import { organizerKeyFactory } from 'tests/factories/organizer-key';
import { userFactory } from 'tests/factories/users';

import { db } from '../../../libs/db';
import { validAccessKey } from './valid-access-key.server';

describe('#validAccessKey', () => {
  it('updates the user organizer key when key is valid', async () => {
    const key = await organizerKeyFactory();
    const user = await userFactory();
    await validAccessKey(user.id, key.id);
    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.organizerKey).toBe(key.id);
  });

  it('return an error when key does not exist', async () => {
    const user = await userFactory();
    const errors = await validAccessKey(user.id, 'unknown');
    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.organizerKey).toBeNull();
    expect(errors?.errors?.key).toEqual('Invalid API key');
  });

  it('return an error when key is revoked', async () => {
    const key = await organizerKeyFactory({ attributes: { revokedAt: new Date() } });
    const user = await userFactory();
    const errors = await validAccessKey(user.id, key.id);
    expect(errors?.errors?.key).toEqual('Invalid API key');
  });
});
