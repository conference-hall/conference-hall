import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { hasTeamAccess } from './has-team-access.server.ts';

describe('hasTeamAccess', () => {
  it('returns true when user has an organizer key', async () => {
    const user = await userFactory({ isOrganizer: true });
    expect(await hasTeamAccess(user.id)).toBe(true);
  });

  it('returns true when user belongs to a team', async () => {
    const user = await userFactory();
    const team = await teamFactory();
    await db.teamMember.create({ data: { memberId: user.id, teamId: team.id, role: 'MEMBER' } });

    expect(await hasTeamAccess(user.id)).toBe(true);
  });

  it('returns false when user has no organizer key and no teams', async () => {
    const user = await userFactory();
    expect(await hasTeamAccess(user.id)).toBe(false);
  });

  it('returns false when user does not exist', async () => {
    expect(await hasTeamAccess('nonexistent')).toBe(false);
  });
});
