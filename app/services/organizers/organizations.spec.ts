import { disconnectDB, resetDB } from 'tests/db-helpers';
import { inviteFactory } from 'tests/factories/invite';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { OrganizationNotFoundError } from '../errors';
import { getInvitationLink, updateOrganization } from './organizations.server';

describe('#getInvitationLink', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the role of the user in the organization', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ members: [user] });
    const invite = await inviteFactory({ organization, user });
    const link = await getInvitationLink(organization.slug, user.id);
    expect(link).toEqual(`http://localhost:3001/invitation/${invite?.id}`);
  });

  it('returns nothing if no invite found', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ members: [user] });
    const link = await getInvitationLink(organization.slug, user.id);
    expect(link).toBeUndefined();
  });
});

describe('#updateOrganization', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('updates the organization', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({
      attributes: { name: 'Hello world', slug: 'hello-world' },
      owners: [user],
    });
    const result = await updateOrganization(organization.slug, user.id, {
      name: 'Hello world updated',
      slug: 'hello-world-updated',
    });
    expect(result.slug).toEqual('hello-world-updated');
  });

  it('throws an error if user is not owner', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ members: [user] });

    await expect(updateOrganization(organization.slug, user.id, { name: 'name', slug: 'slug' })).rejects.toThrowError(
      OrganizationNotFoundError
    );
  });

  it('returns an error if the slug already exists', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ attributes: { slug: 'hello-world-1' }, owners: [user] });
    await organizationFactory({ attributes: { slug: 'hello-world-2' }, owners: [user] });
    const result = await updateOrganization(organization.slug, user.id, {
      name: 'Hello world',
      slug: 'hello-world-2',
    });
    expect(result?.fieldErrors?.slug).toEqual('Slug already exists, please try another one.');
  });
});
