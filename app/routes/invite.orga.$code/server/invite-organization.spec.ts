import { OrganizationRole } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { addMember, checkOrganizationInviteCode } from './invite-organization.server';
import { db } from '~/libs/db';

describe('#addMember', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('adds the member as reviewer to the organization', async () => {
    const owner = await userFactory();
    const member = await userFactory();
    const organization = await organizationFactory({ owners: [owner] });

    const result = await addMember(organization.invitationCode, member.id);

    const orgaMember = await db.organizationMember.findUnique({
      where: { memberId_organizationId: { memberId: member.id, organizationId: organization.id } },
    });

    expect(orgaMember?.role).toBe(OrganizationRole.REVIEWER);
    expect(result?.slug).toBe(organization.slug);
  });

  it('returns null when invitation code does not exist', async () => {
    const user = await userFactory();
    const result = await addMember('XXX', user.id);
    expect(result).toBe(null);
  });
});

describe('#checkOrganizationInviteCode', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the organization for an invitation code', async () => {
    const owner = await userFactory();
    const organization = await organizationFactory({ owners: [owner] });

    const result = await checkOrganizationInviteCode(organization.invitationCode);

    expect(result).toEqual({
      id: organization.id,
      slug: organization.slug,
      name: organization.name,
    });
  });

  it('returns null when invitation code does not exist', async () => {
    const result = await checkOrganizationInviteCode('XXX');
    expect(result).toBeNull();
  });
});
