import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';
import { ForbiddenOperationError } from '../../libs/errors';
import { allowedForEvent, allowedForTeam } from './check-user-role.server';

describe('#allowedForOrga', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the organization if user has access to the organization', async () => {
    const user = await userFactory();
    const organization = await teamFactory({ owners: [user] });

    const result = await allowedForTeam(organization.slug, user.id);
    expect(result.id).toEqual(organization.id);
  });

  it('returns the organization if user role part of accepted ones', async () => {
    const user = await userFactory();
    const organization = await teamFactory({ owners: [user] });

    const result = await allowedForTeam(organization.slug, user.id, ['OWNER']);
    expect(result.id).toEqual(organization.id);
  });

  it('throws an error if user role is not in the accepted role list', async () => {
    const user = await userFactory();
    const organization = await teamFactory({ owners: [user] });
    await expect(allowedForTeam(organization.slug, user.id, ['MEMBER'])).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if user role is not part of the organization', async () => {
    const user = await userFactory();
    const organization = await teamFactory();
    await expect(allowedForTeam(organization.slug, user.id)).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if event does not exist', async () => {
    const user = await userFactory();
    await expect(allowedForTeam('AAAA', user.id)).rejects.toThrowError(ForbiddenOperationError);
  });
});

describe('#allowedForEvent', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the event if user has access to the event', async () => {
    const user = await userFactory();
    const team = await teamFactory({ owners: [user] });
    const event = await eventFactory({ team });

    const result = await allowedForEvent(event.slug, user.id);
    expect(result.id).toEqual(event.id);
  });

  it('returns the event if user role part of accepted ones', async () => {
    const user = await userFactory();
    const team = await teamFactory({ owners: [user] });
    const event = await eventFactory({ team });

    const result = await allowedForEvent(event.slug, user.id, ['OWNER']);
    expect(result.id).toEqual(event.id);
  });

  it('throws an error if user role is not in the accepted role list', async () => {
    const user = await userFactory();
    const team = await teamFactory({ owners: [user] });
    const event = await eventFactory({ team });
    await expect(allowedForEvent(event.slug, user.id, ['MEMBER'])).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if user role is not part of the team event', async () => {
    const user = await userFactory();
    const team = await teamFactory();
    const event = await eventFactory({ team });
    await expect(allowedForEvent(event.slug, user.id)).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if event does not exist', async () => {
    const user = await userFactory();
    await expect(allowedForEvent('AAAA', user.id)).rejects.toThrowError(ForbiddenOperationError);
  });
});
