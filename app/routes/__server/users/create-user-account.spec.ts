import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.ts';

import { createUserAccount } from './create-user-account.server.ts';

describe('#createUser', () => {
  it('creates a new user', async () => {
    const userId = await createUserAccount({
      uid: '123',
      name: 'Bob',
      email: 'bob@example.com',
      picture: 'https://image.com/image.png',
    });

    const created = await db.account.findFirst({ where: { uid: '123' }, include: { user: true } });
    expect(created?.uid).toEqual('123');
    expect(created?.name).toEqual('Bob');
    expect(created?.email).toEqual('bob@example.com');
    expect(created?.picture).toEqual('https://image.com/image.png');

    expect(userId).toEqual(created?.user?.id);
    expect(created?.user?.name).toEqual('Bob');
    expect(created?.user?.email).toEqual('bob@example.com');
    expect(created?.user?.picture).toEqual('https://image.com/image.png');
  });

  it('returns existing user if already exists', async () => {
    const user = await userFactory();
    const account = await db.account.findFirst({ where: { userId: user.id } });

    if (!account) throw new Error('Team not found');

    const userId = await createUserAccount({
      uid: account.uid,
      name: 'Bob',
      email: 'bob@example.com',
      picture: 'https://image.com/image.png',
    });

    expect(userId).toEqual(user.id);
  });
});
