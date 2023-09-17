import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.ts';
import { UserNotFoundError } from '~/libs/errors.ts';

import { saveUserAdditionalInfo, saveUserDetails, saveUserPersonalInfo } from './save-profile.server.ts';

describe('#saveUserPersonalInfo', () => {
  it('updates personal information', async () => {
    const user = await userFactory();

    await saveUserPersonalInfo(user.id, {
      name: 'John Doe',
      email: 'john.doe@email.com',
      picture: 'https://example.com/photo.jpg',
    });

    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.name).toEqual('John Doe');
    expect(updated?.email).toEqual('john.doe@email.com');
    expect(updated?.picture).toEqual('https://example.com/photo.jpg');
  });

  it('throws an error when user not found', async () => {
    const data = { name: '', email: '', picture: '' };
    await expect(saveUserPersonalInfo('XXX', data)).rejects.toThrowError(UserNotFoundError);
  });
});

describe('#saveUserDetails', () => {
  it('updates user details', async () => {
    const user = await userFactory();

    await saveUserDetails(user.id, {
      bio: 'lorem ipsum',
      references: 'impedit quidem quisquam',
    });

    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.bio).toEqual('lorem ipsum');
    expect(updated?.references).toEqual('impedit quidem quisquam');
  });

  it('throws an error when user not found', async () => {
    const data = { bio: '', references: '' };
    await expect(saveUserDetails('XXX', data)).rejects.toThrowError(UserNotFoundError);
  });
});

describe('#saveUserAdditionalInfo', () => {
  it('updates user additional information', async () => {
    const user = await userFactory();

    await saveUserAdditionalInfo(user.id, {
      company: 'company',
      address: 'address',
      twitter: 'twitter',
      github: 'github',
    });

    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(updated?.company).toEqual('company');
    expect(updated?.address).toEqual('address');
    expect(updated?.socials).toEqual({ github: 'github', twitter: 'twitter' });
  });

  it('throws an error when user not found', async () => {
    const data = { company: '', address: '', twitter: '', github: '' };
    await expect(saveUserAdditionalInfo('XXX', data)).rejects.toThrowError(UserNotFoundError);
  });
});