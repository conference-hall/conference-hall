import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ForbiddenOperationError } from '~/libs/errors.ts';

import { allowedForEvent } from './check-user-role.server.ts';

describe('#allowedForEvent', () => {
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
