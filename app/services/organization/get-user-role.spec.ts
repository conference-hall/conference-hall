import { disconnectDB, resetDB } from 'tests/db-helpers';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { getUserRole } from './get-user-role.server';

describe('#getUserRole', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the role of the user in the organization', async () => {
    const user = await userFactory();
    const orga = await organizationFactory({ members: [user] });
    const role = await getUserRole(orga.slug, user.id);
    expect(role).toEqual('MEMBER');
  });

  it('returns null if user does not belong to the organization', async () => {
    const user = await userFactory();
    const orga = await organizationFactory();
    const role = await getUserRole(orga.slug, user.id);
    expect(role).toBeNull();
  });
});
