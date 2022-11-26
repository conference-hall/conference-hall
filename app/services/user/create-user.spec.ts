import { disconnectDB, resetDB } from 'tests/db-helpers';
import { userFactory } from 'tests/factories/users';
import { db } from '../../libs/db';
import { createUser } from './create-user.server';

describe('#createUser', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('creates a new user', async () => {
    const result = await createUser({
      uid: '123',
      name: 'Bob',
      email: 'bob@example.com',
      picture: 'https://image.com/image.png',
    });

    const created = await db.user.findFirst({ where: { id: '123' } });
    expect(result).toEqual('123');
    expect(created?.id).toEqual('123');
    expect(created?.name).toEqual('Bob');
    expect(created?.email).toEqual('bob@example.com');
    expect(created?.photoURL).toEqual('https://image.com/image.png');
  });

  it('returns existing user if already exists', async () => {
    const user = await userFactory();
    const result = await createUser({
      uid: user.id,
      name: 'Bob',
      email: 'bob@example.com',
      picture: 'https://image.com/image.png',
    });

    const created = await db.user.findFirst({ where: { id: user.id } });
    expect(result).toEqual(user.id);
    expect(created?.id).toEqual(user.id);
    expect(created?.name).toEqual(user.name);
    expect(created?.email).toEqual(user.email);
    expect(created?.photoURL).toEqual(user.photoURL);
  });
});
