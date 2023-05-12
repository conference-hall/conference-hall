import { OrganizationRole } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { db } from '../../../libs/db';
import { createOrganization } from './create-organization.server';

describe('#createOrganization', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('creates the organization and add the user as owner', async () => {
    const user = await userFactory();
    const result = await createOrganization(user.id, { name: 'Hello world', slug: 'hello-world' });

    const organization = await db.organization.findUnique({ where: { slug: result.slug } });
    expect(organization?.name).toBe('Hello world');
    expect(organization?.slug).toBe('hello-world');

    const orgaMember = await db.organizationMember.findUnique({
      where: { memberId_organizationId: { memberId: user.id, organizationId: organization?.id! } },
    });
    expect(orgaMember?.role).toBe(OrganizationRole.OWNER);
  });

  it('returns an error if the slug already exists', async () => {
    const user = await userFactory();
    await organizationFactory({ attributes: { slug: 'hello-world' }, owners: [user] });
    const result = await createOrganization(user.id, { name: 'Hello world', slug: 'hello-world' });
    expect(result?.fieldErrors?.slug).toEqual('This URL already exists, please try another one.');
  });
});
