import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { ForbiddenOperationError } from '../../libs/errors';
import { checkAccess } from './check-access.server';

describe('#checkAccess', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the organizer role when user has access to the event', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user] });
    const event = await eventFactory({ organization });

    const result = await checkAccess(organization.slug, event.slug, user.id);

    expect(result).toEqual('OWNER');
  });

  it('returns the organizer role if user role part of accepted ones', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user] });
    const event = await eventFactory({ organization });

    const result = await checkAccess(organization.slug, event.slug, user.id, ['OWNER']);

    expect(result).toEqual('OWNER');
  });

  it('throws an error if user role is not in the accepted role list', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user] });
    const event = await eventFactory({ organization });
    await expect(checkAccess(organization.slug, event.slug, user.id, ['MEMBER'])).rejects.toThrowError(
      ForbiddenOperationError
    );
  });

  it('throws an error if user role is not part of the organization', async () => {
    const user = await userFactory();
    const organization = await organizationFactory();
    const event = await eventFactory({ organization });
    await expect(checkAccess(organization.slug, event.slug, user.id)).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if event does not exist', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user] });
    await expect(checkAccess(organization.slug, 'AAAA', user.id)).rejects.toThrowError(ForbiddenOperationError);
  });
});
