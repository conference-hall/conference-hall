import { resetDB, disconnectDB } from '../../../tests/db-helpers';
import { userFactory } from '../../../tests/factories/users';
import { db } from '../../libs/db';
import { UserNotFoundError } from '../../libs/errors';
import { saveProfile } from './save-profile.server';

describe('#saveProfile', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('updates personal information', async () => {
    const user = await userFactory();

    const data = {
      name: 'John Doe',
      email: 'john.doe@email.com',
      picture: 'https://example.com/photo.jpg',
    };

    await saveProfile(user.id, data);

    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.name).toEqual(data.name);
    expect(updated?.email).toEqual(data.email);
    expect(updated?.picture).toEqual(data.picture);
  });

  it('updates user details', async () => {
    const user = await userFactory();

    const data = {
      bio: 'lorem ipsum',
      references: 'impedit quidem quisquam',
    };

    await saveProfile(user.id, data);

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

    await saveProfile(user.id, data);

    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.company).toEqual(data.company);
    expect(updated?.address).toEqual(data.address);
    expect(updated?.twitter).toEqual(data.twitter);
    expect(updated?.github).toEqual(data.github);
  });

  it('throws an error when user not found', async () => {
    const data = { bio: '', references: '' };
    await expect(saveProfile('XXX', data)).rejects.toThrowError(UserNotFoundError);
  });
});
