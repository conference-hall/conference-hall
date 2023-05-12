import { disconnectDB, resetDB } from 'tests/db-helpers';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';
import { checkOrganizerAccess } from './check-organizer-access.server';

describe('#checkOrganizerAccess', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('can access if user has an organizer key', async () => {
    const user = await userFactory({ isOrganizer: true });
    const canAccess = await checkOrganizerAccess(user.id);
    expect(canAccess).toBe(true);
  });

  it('can access if user belongs to an organization', async () => {
    const user = await userFactory();
    await teamFactory({ members: [user] });
    const canAccess = await checkOrganizerAccess(user.id);
    expect(canAccess).toBe(true);
  });

  it('cannot access if user does not have organizer key or organizations', async () => {
    const user = await userFactory();
    const canAccess = await checkOrganizerAccess(user.id);
    expect(canAccess).toBe(false);
  });
});
