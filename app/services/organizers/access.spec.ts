import { disconnectDB, resetDB } from 'tests/db-helpers';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { hasOrganizerAccess } from './access.server';

describe('#hasOrganizerAccess', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('return true if user has an organizer key', async () => {
    const user = await userFactory({ isOrganizer: true });
    const access = await hasOrganizerAccess(user.id);
    expect(access).toBe(true);
  });

  it('return true if user belongs to an organization', async () => {
    const user = await userFactory();
    await organizationFactory({ members: [user] });
    const access = await hasOrganizerAccess(user.id);
    expect(access).toBe(true);
  });

  it('returns false if user does not have organizer key or organizations', async () => {
    const user = await userFactory();
    const access = await hasOrganizerAccess(user.id);
    expect(access).toBe(false);
  });
});
