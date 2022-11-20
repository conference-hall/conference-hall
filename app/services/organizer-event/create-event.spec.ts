import type { Organization, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { db } from '../db';
import { ForbiddenOperationError } from '../errors';
import { createEvent } from './create-event.server';

describe('#createEvent', () => {
  let owner: User, reviewer: User;
  let organization: Organization;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    reviewer = await userFactory();
    organization = await organizationFactory({ owners: [owner], reviewers: [reviewer] });
  });
  afterEach(disconnectDB);

  it('creates a new event into the organization', async () => {
    const created = await createEvent(organization.slug, owner.id, {
      type: 'CONFERENCE',
      name: 'Hello world',
      slug: 'hello-world',
      visibility: 'PUBLIC',
    });

    expect(created.slug).toBe('hello-world');

    const event = await db.event.findUnique({ where: { slug: created.slug } });
    expect(event?.type).toBe('CONFERENCE');
    expect(event?.name).toBe('Hello world');
    expect(event?.slug).toBe('hello-world');
    expect(event?.visibility).toBe('PUBLIC');
    expect(event?.organizationId).toBe(organization.id);
    expect(event?.creatorId).toBe(owner.id);
  });

  it('returns an error message when slug already exists', async () => {
    await eventFactory({ organization, attributes: { slug: 'hello-world' } });

    const created = await createEvent(organization.slug, owner.id, {
      type: 'CONFERENCE',
      name: 'Hello world',
      slug: 'hello-world',
      visibility: 'PUBLIC',
    });

    expect(created?.error?.fieldErrors?.slug).toEqual('Slug already exists, please try another one.');
  });

  it('throws an error if user is not owner', async () => {
    await expect(
      createEvent(organization.slug, reviewer.id, {
        type: 'CONFERENCE',
        name: 'Hello world',
        slug: 'hello-world',
        visibility: 'PUBLIC',
      })
    ).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    await expect(
      createEvent(organization.slug, user.id, {
        type: 'CONFERENCE',
        name: 'Hello world',
        slug: 'hello-world',
        visibility: 'PUBLIC',
      })
    ).rejects.toThrowError(ForbiddenOperationError);
  });
});
