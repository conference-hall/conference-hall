import type { Event, Team, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';
import { db } from '../../libs/db';
import { ForbiddenOperationError } from '../../libs/errors';
import { updateEvent } from './update-event.server';

describe('#updateEvent', () => {
  let owner: User, reviewer: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    reviewer = await userFactory();
    team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ team });
  });
  afterEach(disconnectDB);

  it('creates a new event into the team', async () => {
    const created = await updateEvent(event.slug, owner.id, {
      name: 'Updated',
      slug: 'updated',
      visibility: 'PUBLIC',
      address: 'Address',
      description: 'Updated',
      categoriesRequired: true,
      formatsRequired: true,
      codeOfConductUrl: 'codeOfConductUrl',
      emailNotifications: ['submitted'],
      logo: 'logo',
      apiKey: 'apiKey',
    });

    expect(created.slug).toBe('updated');

    const updated = await db.event.findUnique({ where: { slug: created.slug } });
    expect(updated?.name).toBe('Updated');
    expect(updated?.slug).toBe('updated');
    expect(updated?.visibility).toBe('PUBLIC');
    expect(updated?.address).toBe('Address');
    expect(updated?.categoriesRequired).toBe(true);
    expect(updated?.formatsRequired).toBe(true);
    expect(updated?.description).toBe('Updated');
    expect(updated?.logo).toBe('logo');
    expect(updated?.codeOfConductUrl).toBe('codeOfConductUrl');
    expect(updated?.emailNotifications).toEqual(['submitted']);
    expect(updated?.apiKey).toBe('apiKey');
  });

  it.todo('test address geocoding');

  it('returns an error message when slug already exists', async () => {
    await eventFactory({ team, attributes: { slug: 'hello-world' } });
    const created = await updateEvent(event.slug, owner.id, { slug: 'hello-world' });
    expect(created.error).toEqual('This URL already exists, please try another one.');
  });

  it('throws an error if user is not owner', async () => {
    await expect(updateEvent(event.slug, reviewer.id, { name: 'Hello world' })).rejects.toThrowError(
      ForbiddenOperationError
    );
  });

  it('throws an error if user does not belong to event team', async () => {
    const user = await userFactory();
    await expect(updateEvent(event.slug, user.id, { name: 'Hello world' })).rejects.toThrowError(
      ForbiddenOperationError
    );
  });
});
