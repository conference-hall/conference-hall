import { disconnectDB, resetDB } from 'tests/db-helpers';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';
import { checkTeamAccess } from './check-team-access.server';

describe('#checkOrganizerAccess', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('can access if user has an organizer key', async () => {
    const user = await userFactory({ isOrganizer: true });
    const canAccess = await checkTeamAccess(user.id);
    expect(canAccess).toBe(true);
  });

  it('can access if user belongs to a team', async () => {
    const user = await userFactory();
    await teamFactory({ members: [user] });
    const canAccess = await checkTeamAccess(user.id);
    expect(canAccess).toBe(true);
  });

  it('cannot access if user does not have organizer key or belongs to a team', async () => {
    const user = await userFactory();
    const canAccess = await checkTeamAccess(user.id);
    expect(canAccess).toBe(false);
  });
});
