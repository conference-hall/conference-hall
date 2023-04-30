import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { ForbiddenOperationError } from '../../libs/errors';
import { allowedForEvent, allowedForOrga } from './check-user-role.server';

describe('#allowedForOrga', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns true if user has access to the organization', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user] });

    const allowed = await allowedForOrga(organization.slug, user.id);
    expect(allowed).toBeTruthy();
  });

  it('returns true if user role part of accepted ones', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user] });

    const allowed = await allowedForOrga(organization.slug, user.id, ['OWNER']);
    expect(allowed).toBeTruthy();
  });

  it('throws an error if user role is not in the accepted role list', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user] });
    await expect(allowedForOrga(organization.slug, user.id, ['MEMBER'])).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if user role is not part of the organization', async () => {
    const user = await userFactory();
    const organization = await organizationFactory();
    await expect(allowedForOrga(organization.slug, user.id)).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if event does not exist', async () => {
    const user = await userFactory();
    await expect(allowedForOrga('AAAA', user.id)).rejects.toThrowError(ForbiddenOperationError);
  });
});

describe('#allowedForEvent', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns true if user has access to the event', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user] });
    const event = await eventFactory({ organization });

    const allowed = await allowedForEvent(event.slug, user.id);
    expect(allowed).toBeTruthy();
  });

  it('returns true if user role part of accepted ones', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user] });
    const event = await eventFactory({ organization });

    const allowed = await allowedForEvent(event.slug, user.id, ['OWNER']);
    expect(allowed).toBeTruthy();
  });

  it('throws an error if user role is not in the accepted role list', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user] });
    const event = await eventFactory({ organization });
    await expect(allowedForEvent(event.slug, user.id, ['MEMBER'])).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if user role is not part of the organization event', async () => {
    const user = await userFactory();
    const organization = await organizationFactory();
    const event = await eventFactory({ organization });
    await expect(allowedForEvent(event.slug, user.id)).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if event does not exist', async () => {
    const user = await userFactory();
    await expect(allowedForEvent('AAAA', user.id)).rejects.toThrowError(ForbiddenOperationError);
  });
});
