import type { Event, Organization, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { db } from '../db';
import { ForbiddenOperationError } from '../errors';
import { updateEvent } from './update-event.server';

describe('#updateEvent', () => {
  let owner: User, reviewer: User;
  let organization: Organization;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    reviewer = await userFactory();
    organization = await organizationFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ organization });
  });
  afterEach(disconnectDB);

  it('creates a new event into the organization', async () => {
    const created = await updateEvent(organization.slug, event.slug, owner.id, {
      name: 'Updated',
      slug: 'updated',
      visibility: 'PUBLIC',
      address: 'Address',
      description: 'Updated',
      categoriesRequired: true,
      formatsRequired: true,
      codeOfConductUrl: 'codeOfConductUrl',
      emailNotifications: ['submitted'],
      bannerUrl: 'Banner',
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
    expect(updated?.bannerUrl).toBe('Banner');
    expect(updated?.codeOfConductUrl).toBe('codeOfConductUrl');
    expect(updated?.emailNotifications).toEqual(['submitted']);
    expect(updated?.apiKey).toBe('apiKey');
  });

  it.todo('test address geocoding');

  it('returns an error message when slug already exists', async () => {
    await eventFactory({ organization, attributes: { slug: 'hello-world' } });
    const created = await updateEvent(organization.slug, event.slug, owner.id, { slug: 'hello-world' });
    expect(created?.error?.fieldErrors?.slug).toEqual('Slug already exists, please try another one.');
  });

  it('throws an error if user is not owner', async () => {
    await expect(updateEvent(organization.slug, event.slug, reviewer.id, { name: 'Hello world' })).rejects.toThrowError(
      ForbiddenOperationError
    );
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    await expect(updateEvent(organization.slug, event.slug, user.id, { name: 'Hello world' })).rejects.toThrowError(
      ForbiddenOperationError
    );
  });
});
