import { TeamRole } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';
import { addMember, checkTeamInviteCode } from './invite-organization.server';
import { db } from '~/libs/db';
import { InvitationNotFoundError } from '~/libs/errors';

describe('#addMember', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('adds the member as reviewer to the organization', async () => {
    const owner = await userFactory();
    const member = await userFactory();
    const organization = await teamFactory({ owners: [owner] });

    const result = await addMember(organization.invitationCode, member.id);

    const orgaMember = await db.teamMember.findUnique({
      where: { memberId_teamId: { memberId: member.id, teamId: organization.id } },
    });

    expect(orgaMember?.role).toBe(TeamRole.REVIEWER);
    expect(result?.slug).toBe(organization.slug);
  });

  it('returns throws an error when invitation code does not exist', async () => {
    const user = await userFactory();
    await expect(addMember('XXX', user.id)).rejects.toThrowError(InvitationNotFoundError);
  });
});

describe('#checkOrganizationInviteCode', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the organization for an invitation code', async () => {
    const owner = await userFactory();
    const organization = await teamFactory({ owners: [owner] });

    const result = await checkTeamInviteCode(organization.invitationCode);

    expect(result).toEqual({
      id: organization.id,
      slug: organization.slug,
      name: organization.name,
    });
  });

  it('returns throws an error when invitation code does not exist', async () => {
    await expect(checkTeamInviteCode('XXX')).rejects.toThrowError(InvitationNotFoundError);
  });
});
