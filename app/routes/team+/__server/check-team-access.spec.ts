import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { checkTeamAccess } from './check-team-access.server.ts';

describe('#checkOrganizerAccess', () => {
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
