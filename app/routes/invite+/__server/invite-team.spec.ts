import { TeamRole } from '@prisma/client';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.ts';
import { InvitationNotFoundError } from '~/libs/errors.ts';

import { addMember, checkTeamInviteCode } from './invite-team.server.ts';

describe('#addMember', () => {
  it('adds the member as reviewer to the team', async () => {
    const owner = await userFactory();
    const member = await userFactory();
    const team = await teamFactory({ owners: [owner] });

    const result = await addMember(team.invitationCode, member.id);

    const orgaMember = await db.teamMember.findUnique({
      where: { memberId_teamId: { memberId: member.id, teamId: team.id } },
    });

    expect(orgaMember?.role).toBe(TeamRole.REVIEWER);
    expect(result?.slug).toBe(team.slug);
  });

  it('returns throws an error when invitation code does not exist', async () => {
    const user = await userFactory();
    await expect(addMember('XXX', user.id)).rejects.toThrowError(InvitationNotFoundError);
  });
});

describe('#checkOrganizationInviteCode', () => {
  it('returns the team for an invitation code', async () => {
    const owner = await userFactory();
    const team = await teamFactory({ owners: [owner] });

    const result = await checkTeamInviteCode(team.invitationCode);

    expect(result).toEqual({
      id: team.id,
      slug: team.slug,
      name: team.name,
    });
  });

  it('returns throws an error when invitation code does not exist', async () => {
    await expect(checkTeamInviteCode('XXX')).rejects.toThrowError(InvitationNotFoundError);
  });
});
