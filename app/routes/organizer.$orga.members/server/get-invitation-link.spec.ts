import { disconnectDB, resetDB } from 'tests/db-helpers';
import { inviteFactory } from 'tests/factories/invite';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { getInvitationLink } from './get-invitation-link.server';

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
