import { disconnectDB, resetDB } from 'tests/db-helpers';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';
import { ForbiddenOperationError } from '../../../libs/errors';
import { updateOrganization } from './update-organization.server';

describe('#updateOrganization', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('updates the organization', async () => {
    const user = await userFactory();
    const organization = await teamFactory({
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
    const organization = await teamFactory({ members: [user] });

    await expect(updateOrganization(organization.slug, user.id, { name: 'name', slug: 'slug' })).rejects.toThrowError(
      ForbiddenOperationError
    );
  });

  it('returns an error if the slug already exists', async () => {
    const user = await userFactory();
    const organization = await teamFactory({ attributes: { slug: 'hello-world-1' }, owners: [user] });
    await teamFactory({ attributes: { slug: 'hello-world-2' }, owners: [user] });
    const result = await updateOrganization(organization.slug, user.id, {
      name: 'Hello world',
      slug: 'hello-world-2',
    });
    expect(result?.fieldErrors?.slug).toEqual('This URL already exists, please try another one.');
  });
});
