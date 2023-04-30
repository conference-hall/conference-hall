import type { Event, EventCategory, EventFormat, Organization, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events';
import { eventFormatFactory } from 'tests/factories/formats';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { deleteCategory, deleteFormat, saveCategory, saveFormat } from './update-tracks.server';
import { db } from '~/libs/db';
import { ForbiddenOperationError } from '~/libs/errors';

describe('#saveFormat', () => {
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

  it('adds a new format', async () => {
    await saveFormat(event.slug, owner.id, {
      name: 'Format 1',
      description: 'Format 1',
    });

    const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { formats: true } });

    expect(updated?.formats.length).toBe(1);
    expect(updated?.formats[0].name).toBe('Format 1');
    expect(updated?.formats[0].description).toBe('Format 1');
  });

  it('updates an event format', async () => {
    const format = await eventFormatFactory({ event, attributes: { name: 'name', description: 'desc' } });
    await saveFormat(event.slug, owner.id, {
      id: format.id,
      name: 'Format 1',
      description: 'Format 1',
    });

    const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { formats: true } });

    expect(updated?.formats.length).toBe(1);
    expect(updated?.formats[0].name).toBe('Format 1');
    expect(updated?.formats[0].description).toBe('Format 1');
  });

  it('throws an error if user is not owner', async () => {
    await expect(saveFormat(event.slug, reviewer.id, { name: 'Hello world', description: null })).rejects.toThrowError(
      ForbiddenOperationError
    );
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    await expect(saveFormat(event.slug, user.id, { name: 'Hello world', description: null })).rejects.toThrowError(
      ForbiddenOperationError
    );
  });
});

describe('#saveCategory', () => {
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

  it('adds a new category', async () => {
    await saveCategory(event.slug, owner.id, {
      name: 'Category 1',
      description: 'Category 1',
    });

    const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { categories: true } });

    expect(updated?.categories.length).toBe(1);
    expect(updated?.categories[0].name).toBe('Category 1');
    expect(updated?.categories[0].description).toBe('Category 1');
  });

  it('updates an event category', async () => {
    const category = await eventCategoryFactory({ event, attributes: { name: 'name', description: 'desc' } });
    await saveCategory(event.slug, owner.id, {
      id: category.id,
      name: 'Category 1',
      description: 'Category 1',
    });

    const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { categories: true } });

    expect(updated?.categories.length).toBe(1);
    expect(updated?.categories[0].name).toBe('Category 1');
    expect(updated?.categories[0].description).toBe('Category 1');
  });

  it('throws an error if user is not owner', async () => {
    await expect(
      saveCategory(event.slug, reviewer.id, { name: 'Hello world', description: null })
    ).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    await expect(saveCategory(event.slug, user.id, { name: 'Hello world', description: null })).rejects.toThrowError(
      ForbiddenOperationError
    );
  });
});

describe('#deleteFormat', () => {
  let owner: User, reviewer: User;
  let organization: Organization;
  let event: Event;
  let format: EventFormat;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    reviewer = await userFactory();
    organization = await organizationFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ organization });
    format = await eventFormatFactory({ event });
  });
  afterEach(disconnectDB);

  it('deletes an event format', async () => {
    await deleteFormat(event.slug, owner.id, format.id);
    const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { formats: true } });
    expect(updated?.formats.length).toBe(0);
  });

  it('throws an error if user is not owner', async () => {
    await expect(deleteFormat(event.slug, reviewer.id, format.id)).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    await expect(deleteFormat(event.slug, user.id, format.id)).rejects.toThrowError(ForbiddenOperationError);
  });
});

describe('#deleteCategory', () => {
  let owner: User, reviewer: User;
  let organization: Organization;
  let event: Event;
  let category: EventCategory;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    reviewer = await userFactory();
    organization = await organizationFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ organization });
    category = await eventCategoryFactory({ event });
  });
  afterEach(disconnectDB);

  it('deletes an event category', async () => {
    await deleteCategory(event.slug, owner.id, category.id);
    const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { categories: true } });
    expect(updated?.categories.length).toBe(0);
  });

  it('throws an error if user is not owner', async () => {
    await expect(deleteCategory(event.slug, reviewer.id, category.id)).rejects.toThrowError(ForbiddenOperationError);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    await expect(deleteCategory(event.slug, user.id, category.id)).rejects.toThrowError(ForbiddenOperationError);
  });
});
