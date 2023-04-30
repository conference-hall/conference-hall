import { disconnectDB, resetDB } from 'tests/db-helpers';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { OrganizationNotFoundError } from '../../../libs/errors';
import { getOrganization } from './get-organization.server';
import { config } from '~/libs/config';

describe('#getOrganization', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns organization belonging to user', async () => {
    const user = await userFactory();
    await organizationFactory({ owners: [user], attributes: { name: 'My orga 1', slug: 'my-orga1' } });
    const orga = await organizationFactory({ members: [user], attributes: { name: 'My orga 2', slug: 'my-orga2' } });

    const organizations = await getOrganization('my-orga2', user.id);

    expect(organizations).toEqual({
      id: orga.id,
      name: 'My orga 2',
      slug: 'my-orga2',
      role: 'MEMBER',
      invitationLink: `${config.appUrl}/invite/orga/${orga.invitationCode}`,
    });
  });

  it('throws an error when user is not member of the organization', async () => {
    const user = await userFactory();
    await organizationFactory({ attributes: { name: 'My orga', slug: 'my-orga' } });
    await expect(getOrganization('my-orga', user.id)).rejects.toThrowError(OrganizationNotFoundError);
  });

  it('throws an error when organization not found', async () => {
    const user = await userFactory();
    await expect(getOrganization('XXX', user.id)).rejects.toThrowError(OrganizationNotFoundError);
  });
});
