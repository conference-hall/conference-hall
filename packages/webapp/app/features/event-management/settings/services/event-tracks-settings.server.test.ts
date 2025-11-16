import type { Event, EventCategory, EventFormat, Team, User } from '@conference-hall/database';
import { db } from '@conference-hall/database';
import { eventCategoryFactory } from '@conference-hall/database/tests/factories/categories.ts';
import { eventFactory } from '@conference-hall/database/tests/factories/events.ts';
import { eventFormatFactory } from '@conference-hall/database/tests/factories/formats.ts';
import { teamFactory } from '@conference-hall/database/tests/factories/team.ts';
import { userFactory } from '@conference-hall/database/tests/factories/users.ts';

import { ForbiddenOperationError } from '~/shared/errors.server.ts';

import { EventTracksSettings } from './event-tracks-settings.server.ts';

describe('EventTracksSettings', () => {
  let owner: User;
  let reviewer: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory();
    reviewer = await userFactory();
    team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ team });
  });

  describe('#saveFormat', () => {
    it('adds a new format', async () => {
      await EventTracksSettings.for(owner.id, team.slug, event.slug).saveFormat({
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
      await EventTracksSettings.for(owner.id, team.slug, event.slug).saveFormat({
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
      await expect(
        EventTracksSettings.for(reviewer.id, team.slug, event.slug).saveFormat({
          name: 'Hello world',
          description: 'Hello world',
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      await expect(
        EventTracksSettings.for(user.id, team.slug, event.slug).saveFormat({
          name: 'Hello world',
          description: 'Hello world',
        }),
      ).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#saveCategory', () => {
    it('adds a new category', async () => {
      await EventTracksSettings.for(owner.id, team.slug, event.slug).saveCategory({
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
      await EventTracksSettings.for(owner.id, team.slug, event.slug).saveCategory({
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
      const settings = EventTracksSettings.for(reviewer.id, team.slug, event.slug);
      await expect(settings.saveCategory({ name: 'Hello world', description: 'Hello world' })).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const settings = EventTracksSettings.for(user.id, team.slug, event.slug);
      await expect(settings.saveCategory({ name: 'Hello world', description: 'Hello world' })).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });

  describe('#deleteFormat', () => {
    let format: EventFormat;

    beforeEach(async () => {
      format = await eventFormatFactory({ event });
    });

    it('deletes an event format', async () => {
      const settings = EventTracksSettings.for(owner.id, team.slug, event.slug);
      await settings.deleteFormat(format.id);
      const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { formats: true } });
      expect(updated?.formats.length).toBe(0);
    });

    it('throws an error if user is not owner', async () => {
      const settings = EventTracksSettings.for(reviewer.id, team.slug, event.slug);
      await expect(settings.deleteFormat(format.id)).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const settings = EventTracksSettings.for(user.id, team.slug, event.slug);
      await expect(settings.deleteFormat(format.id)).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#deleteCategory', () => {
    let category: EventCategory;

    beforeEach(async () => {
      category = await eventCategoryFactory({ event });
    });

    it('deletes an event category', async () => {
      const settings = EventTracksSettings.for(owner.id, team.slug, event.slug);
      await settings.deleteCategory(category.id);
      const updated = await db.event.findUnique({ where: { slug: event.slug }, include: { categories: true } });
      expect(updated?.categories.length).toBe(0);
    });

    it('throws an error if user is not owner', async () => {
      const settings = EventTracksSettings.for(reviewer.id, team.slug, event.slug);
      await expect(settings.deleteCategory(category.id)).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user does not belong to event team', async () => {
      const user = await userFactory();
      const settings = EventTracksSettings.for(user.id, team.slug, event.slug);
      await expect(settings.deleteCategory(category.id)).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
