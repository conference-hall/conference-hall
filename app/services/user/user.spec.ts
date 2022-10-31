import { organizationFactory } from 'tests/factories/organization';
import { resetDB, disconnectDB } from '../../../tests/db-helpers';
import { userFactory } from '../../../tests/factories/users';
import { db } from '../db';
import { UserNotFoundError } from '../errors';
import { createUser, getUser } from './user.server';

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

describe('#getUser', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the default response', async () => {
    const user = await userFactory();

    const response = await getUser(user.id);
    expect(response).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      bio: user.bio,
      references: user.references,
      company: user.company,
      address: user.address,
      twitter: user.twitter,
      github: user.github,
      organizationsCount: 0,
    });
  });

  it('returns a profile with organizations count', async () => {
    const user = await userFactory();
    await organizationFactory({ owners: [user] });
    await organizationFactory({ reviewers: [user] });
    await organizationFactory({ members: [user] });

    const response = await getUser(user.id);
    expect(response.organizationsCount).toBe(3);
  });

  it('throws an error when user not found', async () => {
    await expect(getUser('XXX')).rejects.toThrowError(UserNotFoundError);
  });
});
