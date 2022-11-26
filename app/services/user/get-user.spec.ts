import { disconnectDB, resetDB } from 'tests/db-helpers';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { UserNotFoundError } from '../../libs/errors';
import { getUser } from './get-user.server';

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
