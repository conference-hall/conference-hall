import { OrganizationRole } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { inviteFactory } from 'tests/factories/invite';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { db } from '../../libs/db';
import { InvitationNotFoundError } from '../../libs/errors';
import { addMember } from './add-member.server';

describe('#addMember', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('adds the member as reviewer to the organization', async () => {
    const owner = await userFactory();
    const member = await userFactory();
    const organization = await organizationFactory({ owners: [owner] });
    const invite = await inviteFactory({ organization, user: owner });

    await addMember(invite?.id!, member.id);

    const orgaMember = await db.organizationMember.findUnique({
      where: { memberId_organizationId: { memberId: member.id, organizationId: organization.id } },
    });
    expect(orgaMember?.role).toBe(OrganizationRole.REVIEWER);
  });

  it('throws an error when invitation not found', async () => {
    const user = await userFactory();
    await expect(addMember('XXX', user.id)).rejects.toThrowError(InvitationNotFoundError);
  });
});
