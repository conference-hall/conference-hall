import { resetDB, disconnectDB } from '../../../tests/db-helpers';
import { userFactory } from '../../../tests/factories/users';
import { db } from '../db';
import { UserNotFoundError } from '../errors';
import { getProfile, updateSettings } from './profile.server';

describe('#getProfile', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the default response', async () => {
    const user = await userFactory();

    const response = await getProfile(user.id);
    expect(response).toEqual({
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

  it.todo('returns a profile with organizations count');

  it('throws an error when user not found', async () => {
    await expect(getProfile('XXX')).rejects.toThrowError(UserNotFoundError);
  });
});

describe('#updateSettings', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('updates personal information', async () => {
    const user = await userFactory();

    const data = {
      name: 'John Doe',
      email: 'john.doe@email.com',
      photoURL: 'https://example.com/photo.jpg',
    };

    await updateSettings(user.id, data);

    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.name).toEqual(data.name);
    expect(updated?.email).toEqual(data.email);
    expect(updated?.photoURL).toEqual(data.photoURL);
  });

  it('updates user details', async () => {
    const user = await userFactory();

    const data = {
      bio: 'lorem ipsum',
      references: 'impedit quidem quisquam',
    };

    await updateSettings(user.id, data);

    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.bio).toEqual(data.bio);
    expect(updated?.references).toEqual(data.references);
  });

  it('updates user additional information', async () => {
    const user = await userFactory();

    const data = {
      company: 'company',
      address: 'address',
      twitter: 'twitter',
      github: 'github',
    };

    await updateSettings(user.id, data);

    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.company).toEqual(data.company);
    expect(updated?.address).toEqual(data.address);
    expect(updated?.twitter).toEqual(data.twitter);
    expect(updated?.github).toEqual(data.github);
  });

  it('throws an error when user not found', async () => {
    const data = { bio: '', references: '' };
    await expect(updateSettings('XXX', data)).rejects.toThrowError(UserNotFoundError);
  });
});
